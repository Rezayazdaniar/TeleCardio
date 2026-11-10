import express from 'express';
import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { isIP } from 'node:net';

const scrypt = promisify(scryptCallback);

const SESSION_DAYS = 7;
const COOKIE_NAME = 'tc_session';

function publicUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone,
    birthDate: row.birth_date || null,
    gender: row.gender || null,
    nationality: row.nationality || null,
    occupation: row.occupation || null,
    email: row.email,
    username: row.username,
    accountType: row.account_type,
    status: row.status,
    doctorLevel: row.doctor_level,
    isAdmin: row.is_admin === true,
  };
}

function cookieToken(req) {
  const header = req.headers.cookie || '';
  const prefix = `${COOKIE_NAME}=`;
  const entry = header.split(';').map(v => v.trim())
    .find(v => v.startsWith(prefix));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return null;
  }
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api',
  });
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function authRequestMetadata(req) {
  const rawIp = typeof req?.headers?.['x-real-ip'] === 'string'
    ? req.headers['x-real-ip'].trim()
    : '';
  const ipAddress = rawIp.length <= 64 && isIP(rawIp) ? rawIp : null;
  const userAgent = typeof req?.headers?.['user-agent'] === 'string'
    ? req.headers['user-agent'].slice(0, 500)
    : '';

  let deviceType = 'unknown';
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (userAgent) {
    deviceType = 'desktop';
  }

  return { ipAddress, deviceType };
}

async function recordAuthEvent(pool, {
  req = null,
  userId = null,
  username,
  eventType,
  reason = null,
}) {
  try {
    const { ipAddress, deviceType } = authRequestMetadata(req);
    const result = await pool.query(`
      INSERT INTO tc_auth_events
        (user_id, username, event_type, reason,
         ip_address, device_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      userId,
      String(username || 'unknown').slice(0, 100),
      eventType,
      reason,
      ipAddress,
      deviceType,
    ]);

    if (eventType === 'login_failure' && ipAddress) {
      const recent = await pool.query(`
        SELECT count(*)::int AS failure_count
        FROM tc_auth_events
        WHERE ip_address = $1
          AND event_type = 'login_failure'
          AND occurred_at >= now() - interval '10 minutes'
      `, [ipAddress]);

      if (recent.rows[0]?.failure_count >= 5) {
        await pool.query(`
          UPDATE tc_auth_events
          SET suspicious = true,
              suspicious_reason = 'repeated_login_failures'
          WHERE id = $1
        `, [result.rows[0].id]);
      }
    }
  } catch (error) {
    console.error(
      'Auth event recording failed:',
      error?.message || 'Unknown error'
    );
  }
}

function validUsername(value) {
  return typeof value === 'string' &&
    /^[a-zA-Z0-9_.-]{3,32}$/.test(value.trim());
}

function validPhone(value) {
  return typeof value === 'string' &&
    /^[+0-9۰-۹٠-٩() -]{8,24}$/.test(value.trim());
}

function validBirthDate(value) {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value) return false;

  const today = new Date();
  const todayIso = [
    today.getUTCFullYear(),
    String(today.getUTCMonth() + 1).padStart(2, '0'),
    String(today.getUTCDate()).padStart(2, '0'),
  ].join('-');

  const earliest = `${today.getUTCFullYear() - 120}-${todayIso.slice(5)}`;
  return value <= todayIso && value >= earliest;
}

async function hashPassword(password, saltHex) {
  const salt = saltHex || randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}

export async function getCurrentUser(req, pool) {
  const token = cookieToken(req);
  if (!token || token.length > 200) return null;

  const result = await pool.query(`
    SELECT u.id, u.first_name, u.last_name, u.phone, u.birth_date,
           u.gender, u.nationality, u.occupation,
           u.email, u.username, u.account_type, u.status,
           u.doctor_level, u.is_admin
    FROM tc_sessions s
    JOIN tc_users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > now()
  `, [tokenHash(token)]);

  return result.rows[0] || null;
}

export async function initializeAuthSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tc_users (
      id uuid PRIMARY KEY,
      first_name text NOT NULL,
      last_name text NOT NULL,
      phone text NOT NULL UNIQUE,
      email text,
      username text NOT NULL,
      password_salt text NOT NULL,
      password_hash text NOT NULL,
      account_type text NOT NULL
        CHECK (account_type IN ('patient', 'doctor')),
      is_admin boolean NOT NULL DEFAULT false,
      status text NOT NULL
        CHECK (status IN ('active', 'pending', 'approved', 'rejected')),
      council_number text,
      doctor_level text
        CHECK (doctor_level IS NULL OR
               doctor_level IN ('triage_doctor', 'specialist_doctor')),
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS tc_users_username_lower_uq
      ON tc_users (lower(username));

    CREATE UNIQUE INDEX IF NOT EXISTS tc_users_email_lower_uq
      ON tc_users (lower(email)) WHERE email IS NOT NULL;

    CREATE TABLE IF NOT EXISTS tc_sessions (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES tc_users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS tc_sessions_user_id_idx
      ON tc_sessions (user_id);

    CREATE INDEX IF NOT EXISTS tc_sessions_expiry_idx
      ON tc_sessions (expires_at);

    CREATE TABLE IF NOT EXISTS tc_auth_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES tc_users(id) ON DELETE SET NULL,
      username text NOT NULL,
      event_type text NOT NULL
        CHECK (event_type IN ('login_success', 'login_failure', 'logout')),
      reason text,
      ip_address text,
      device_type text,
      suspicious boolean NOT NULL DEFAULT false,
      suspicious_reason text,
      occurred_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS tc_auth_events_occurred_at_idx
      ON tc_auth_events (occurred_at DESC);

    CREATE INDEX IF NOT EXISTS tc_auth_events_username_idx
      ON tc_auth_events (lower(username));
  `);


  await pool.query(`
    ALTER TABLE tc_auth_events ADD COLUMN IF NOT EXISTS ip_address text;
    ALTER TABLE tc_auth_events ADD COLUMN IF NOT EXISTS device_type text;
    ALTER TABLE tc_auth_events ADD COLUMN IF NOT EXISTS suspicious boolean NOT NULL DEFAULT false;
    ALTER TABLE tc_auth_events ADD COLUMN IF NOT EXISTS suspicious_reason text;
    CREATE INDEX IF NOT EXISTS tc_auth_events_ip_failure_idx
      ON tc_auth_events (ip_address, occurred_at DESC)
      WHERE event_type = 'login_failure';
  `);

  await pool.query(
    'ALTER TABLE tc_users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false'
  );

  await pool.query(
    'ALTER TABLE tc_users ADD COLUMN IF NOT EXISTS birth_date date'
  );

  await pool.query(`
    ALTER TABLE tc_users ADD COLUMN IF NOT EXISTS gender text;
    ALTER TABLE tc_users ADD COLUMN IF NOT EXISTS nationality text;
    ALTER TABLE tc_users ADD COLUMN IF NOT EXISTS occupation text;
  `);

  await pool.query('DELETE FROM tc_sessions WHERE expires_at <= now()');
}

export function createAuthRouter(pool) {
  const router = express.Router();
  async function currentUser(req) {
    return getCurrentUser(req, pool);
  }

  router.post('/register', async (req, res) => {
    try {
      const body = req.body || {};
      const firstName = typeof body.firstName === 'string'
        ? body.firstName.trim() : '';
      const lastName = typeof body.lastName === 'string'
        ? body.lastName.trim() : '';
      const phone = typeof body.phone === 'string'
        ? body.phone.trim() : '';
      const birthDate = typeof body.birthDate === 'string'
        ? body.birthDate.trim() : '';
      const gender = typeof body.gender === 'string'
        ? body.gender.trim() : '';
      const nationality = typeof body.nationality === 'string'
        ? body.nationality.trim() : '';
      const occupation = typeof body.occupation === 'string'
        ? body.occupation.trim() : '';
      const email = typeof body.email === 'string'
        ? body.email.trim().toLowerCase() : '';
      const username = typeof body.username === 'string'
        ? body.username.trim() : '';
      const password = body.password;
      const accountType = body.accountType;
      const councilNumber = typeof body.councilNumber === 'string'
        ? body.councilNumber.trim() : '';

      if (
        !firstName || firstName.length > 100 ||
        !lastName || lastName.length > 100 ||
        !validPhone(phone) ||
        (accountType === 'patient' && !validBirthDate(birthDate)) ||
        (gender && !['مرد', 'زن', 'ترجیح می‌دهم پاسخ ندهم', 'سایر'].includes(gender)) ||
        nationality.length > 100 ||
        occupation.length > 100 ||
        !validUsername(username) ||
        typeof password !== 'string' ||
        password.length < 10 || password.length > 256 ||
        !['patient', 'doctor'].includes(accountType) ||
        (email && (email.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
        (accountType === 'doctor' &&
          (!councilNumber || councilNumber.length > 80))
      ) {
        return res.status(400).json({
          error: 'اطلاعات ثبت‌نام معتبر نیست یا فیلدهای الزامی کامل نشده‌اند.',
        });
      }

      const { salt, hash } = await hashPassword(password);
      const id = randomUUID();
      const status = accountType === 'doctor' ? 'pending' : 'active';

      const inserted = await pool.query(`
        INSERT INTO tc_users
          (id, first_name, last_name, phone, email, username,
           password_salt, password_hash, account_type, status,
           council_number, birth_date, gender, nationality, occupation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, first_name, last_name, phone, birth_date,
                  gender, nationality, occupation,
                  email, username, account_type, status,
                  doctor_level, is_admin
      `, [
        id, firstName, lastName, phone, email || null, username,
        salt, hash, accountType, status,
        accountType === 'doctor' ? councilNumber : null,
        accountType === 'patient' ? birthDate : null,
        accountType === 'patient' && gender ? gender : null,
        accountType === 'patient' && nationality ? nationality : null,
        accountType === 'patient' && occupation ? occupation : null,
      ]);

      const user = inserted.rows[0];

      if (status === 'pending') {
        return res.status(201).json({
          user: publicUser(user),
          pendingApproval: true,
          message: 'درخواست ثبت‌نام پزشک ثبت شد و پس از تأیید مدیر بررسی می‌شود.',
        });
      }

      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(
        Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
      );

      await pool.query(
        'INSERT INTO tc_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
        [tokenHash(token), user.id, expiresAt]
      );

      setSessionCookie(res, token);
      return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      if (error?.code === '23505') {
        return res.status(409).json({
          error: 'نام کاربری، شماره تلفن یا ایمیل قبلاً ثبت شده است.',
        });
      }
      console.error('Registration failed:', error?.message || 'Unknown error');
      return res.status(500).json({ error: 'ثبت‌نام انجام نشد.' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const body = req.body || {};
      const username = typeof body.username === 'string'
        ? body.username.trim() : '';
      const password = body.password;

      if (!username || typeof password !== 'string' ||
          username.length > 100 || password.length > 256) {
        return res.status(400).json({ error: 'نام کاربری یا رمز عبور نامعتبر است.' });
      }

      const result = await pool.query(`
        SELECT id, first_name, last_name, phone, birth_date,
               gender, nationality, occupation,
               email, username, password_salt, password_hash,
               account_type, status,
               doctor_level, is_admin
        FROM tc_users
        WHERE lower(username) = lower($1)
      `, [username]);

      const row = result.rows[0];
      if (!row) {
        await recordAuthEvent(pool, {
          req,
          username,
          eventType: 'login_failure',
          reason: 'invalid_credentials',
        });
        return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }

      const { hash } = await hashPassword(password, row.password_salt);
      const actual = Buffer.from(hash, 'hex');
      const expected = Buffer.from(row.password_hash, 'hex');

      if (actual.length !== expected.length ||
          !timingSafeEqual(actual, expected)) {
        await recordAuthEvent(pool, {
          req,
          userId: row.id,
          username: row.username,
          eventType: 'login_failure',
          reason: 'invalid_credentials',
        });
        return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
      }

      if (row.status === 'rejected') {
        await recordAuthEvent(pool, {
          req,
          userId: row.id,
          username: row.username,
          eventType: 'login_failure',
          reason: 'account_rejected',
        });
        return res.status(403).json({ error: 'درخواست حساب کاربری تأیید نشده است.' });
      }

      if (row.account_type === 'doctor' && row.status !== 'approved') {
        await recordAuthEvent(pool, {
          req,
          userId: row.id,
          username: row.username,
          eventType: 'login_failure',
          reason: 'doctor_pending',
        });
        return res.status(403).json({
          pendingApproval: true,
          error: 'حساب پزشک هنوز توسط مدیر تأیید نشده است.',
        });
      }

      if (row.account_type === 'doctor' && !row.doctor_level) {
        await recordAuthEvent(pool, {
          req,
          userId: row.id,
          username: row.username,
          eventType: 'login_failure',
          reason: 'doctor_level_missing',
        });
        return res.status(403).json({
          error: 'سطح دسترسی پزشک هنوز توسط مدیر تعیین نشده است.',
        });
      }

      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(
        Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
      );

      await pool.query(
        'INSERT INTO tc_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
        [tokenHash(token), row.id, expiresAt]
      );

      await recordAuthEvent(pool, {
        req,
        userId: row.id,
        username: row.username,
        eventType: 'login_success',
      });

      setSessionCookie(res, token);
      return res.json({ user: publicUser(row) });
    } catch (error) {
      console.error('Login failed:', error?.message || 'Unknown error');
      return res.status(500).json({ error: 'ورود انجام نشد.' });
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const user = await currentUser(req);
      if (!user) {
        clearSessionCookie(res);
        return res.status(401).json({ error: 'نشست معتبر نیست.' });
      }
      return res.json({ user: publicUser(user) });
    } catch (error) {
      console.error('Session check failed:', error?.message || 'Unknown error');
      return res.status(500).json({ error: 'بررسی نشست انجام نشد.' });
    }
  });

  router.post('/logout', async (req, res) => {
    try {
      const token = cookieToken(req);
      if (token && token.length <= 200) {
        const sessionResult = await pool.query(`
          SELECT u.id, u.username
          FROM tc_sessions s
          JOIN tc_users u ON u.id = s.user_id
          WHERE s.token_hash = $1
        `, [tokenHash(token)]);

        const sessionUser = sessionResult.rows[0];
        if (sessionUser) {
          await recordAuthEvent(pool, {
            req,
            userId: sessionUser.id,
            username: sessionUser.username,
            eventType: 'logout',
          });
        }

        await pool.query(
          'DELETE FROM tc_sessions WHERE token_hash = $1',
          [tokenHash(token)]
        );
      }
      clearSessionCookie(res);
      return res.json({ ok: true });
    } catch (error) {
      console.error('Logout failed:', error?.message || 'Unknown error');
      clearSessionCookie(res);
      return res.status(500).json({ error: 'خروج انجام نشد.' });
    }
  });

  return router;
}

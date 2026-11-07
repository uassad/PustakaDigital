This is the role based access control from every actors in this project.

Definition: 
C - Create
R - Read
U - Update
D - Delete

The actors and theirs activity:
1. Administrator
- Upload and manage books (CRUD)
- Profile information (R)
- Logout (D the cookie and session)
- Session/Token (RD)

2. Authenticated User
- Main page to find the books (R)
- Favorited the book (CRD)
- Profile information (RU)
- Password modification / forget password (U)
- Account deletion (D)
- Logout (D the cookie and session)
- Session/Token (RD)

3. Guest
- Main page to find the books (R)
- Login/register (C)
- Session/token (C new and must be unique cookie/JWT/token)

then read the requirement.md
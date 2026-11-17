This file tells all of pages that must include for every actor in this project, and its route between one to another.

Product name: PustakaDigital
Platform: Browser website, localhost, docker environment, HD, 1920px x 1080px 

Guest:
Main page: show the list of book and its cover, navbar and footer, search bar (implement debouncing), login and register, settings
Book reading page: show book pdf inside the page, book informations, navbar and footer, back to home, favorited feature (direct to registration page, after that back again to book reading page)
Login and Register: to make a new account and to get inside full feature of authenticated user, also make the process to forget password that can send the change link to linkage email (majority: gmail), and also registration email linkage link when register into gmail. Login can direct to authenticated user or administrator

Authenticated User:
Main page: show the list of book and its cover, navbar and footer, search bar (implement debouncing), login and register, settings
Book reading page: show book pdf inside the page, book informations, navbar and footer, back to home, favorited feature (direct to registration page, after that back again to book reading page)
Book favorit feature: Add to the favorited book list, can be access in the settings
Settings: choose between profile information, favorited book list, or logout
Profile information: Show the profile information, modify the data, cannot change other account information, must validated again with the password to change the account information, also forget password process (the process cannot be compromise to more ease)
Logout: deactive the cookie/token session
Favorited Book List: Just show the book, its title, and its cover tidy that get favorited

Administrator
Book List Dashboard: Upload book file strictly to .pdf data type, 4 times uploading another file type boundaries or the account will be freezed and cannot be use until the IT change it manually, javascript must protect the wrong data type in front end and python validate also must deny it in back end if not .pdf, .pdf data and file name must also encoded so that file cannot be use to cross site scripting and cross site request forgery, search bar to find the book that listed but must to implement debouncing
Settings: Dropdown list of profile information or logout
Profile information: read only
Logout: deactive the cookie/token session


Authorization strictly do in the backend inside the server and cannot be injected
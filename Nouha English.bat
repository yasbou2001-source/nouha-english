@echo off
rem Nouha English - lanceur / launcher
rem Demarre un petit serveur local (le navigateur memorise alors l autorisation du micro),
rem sinon ouvre simplement index.html.
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  title Nouha English - serveur local
  echo.
  echo   Nouha English khedam 3la: http://localhost:8765
  echo   Khelli had nafida me7loula madam katkhedmi. Sedd-ha bach tw9ef lmaw9i3.
  echo.
  echo   (Site lance sur http://localhost:8765 - laisse cette fenetre ouverte ; ferme-la pour arreter.)
  echo.
  start "" cmd /c "timeout /t 1 /nobreak >nul & start "" http://localhost:8765/"
  python -m http.server 8765 --bind 127.0.0.1
) else (
  start "" "%~dp0index.html"
)

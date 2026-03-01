@echo off
REM Start script for the Next.js dev server. Tries pnpm first, then npm.
cd /d "%~dp0"
echo Starting development server for digital-cooperative-super-app...

where pnpm >nul 2>&1
if %errorlevel%==0 (
  echo Found pnpm, running: pnpm dev
  pnpm dev
) else (
  where npm >nul 2>&1
  if %errorlevel%==0 (
    echo pnpm not found, running: npm run dev
    npm run dev
  ) else (
    echo Neither pnpm nor npm were found in PATH.
    echo Please install Node.js and pnpm or npm, then run this script again.
    pause
  )
)

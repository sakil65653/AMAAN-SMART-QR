# 🚀 AMAAN CSC CENTER - 24/7 Cloud Deployment Guide

Aapka poora portal, Master Admin panel, Member portal, Tools aur Database ko **24/7 Free Internet par live** chalane ke liye 2 sabse aasan tareeqe:

---

## 🌟 Option A: Render.com (Recommended for Full Website + Master Admin + Database)

Render.com par aapka **Frontend + Backend API + Database** teeno ek saath 100% free live ho jayenge.

### Steps to Deploy (Sirf 2 Minute):
1. **GitHub par Push karein**:
   - Apne project folder mein **`PUSH_TO_GITHUB.bat`** run karein taaki aapka code `https://github.com/sakil65653/Amaan-Website-.git` par upload ho jaye.
2. **Render.com par jayein**:
   - [https://render.com](https://render.com) open karein aur **Sign In with GitHub** karein.
3. **New Web Service banayein**:
   - **New +** button par click karein aur **Web Service** choose karein.
   - Apni repository select karein: **`Amaan-Website-`**.
4. **Settings verify karein**:
   - **Name**: `amaan-csc-center`
   - **Runtime**: `Node`
   - **Build Command**: (Khaali chhod dein ya `echo "Build done"`)
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. **Deploy**:
   - **Deploy Web Service** par click karein!
   - 1-2 minute mein aapko ek live public link mil jayega (e.g. `https://amaan-csc-center.onrender.com`).
   - Ab aapka poora portal, public tools, aur Master Admin CMS duniya ke kisi bhi phone ya computer se 24/7 live chalega!

---

## ⚡ Option B: Netlify (Frontend Only)

Agar aap sirf Customer Website aur Browser Tools (Passport Photo Maker, PDF Tools, Typing Master) chalana chahte hain:

1. [https://app.netlify.com](https://app.netlify.com) par login karein.
2. **Add new site** → **Import an existing project** → **GitHub** select karein.
3. Apni repo **`Amaan-Website-`** choose karein.
4. **Publish directory**: `.` (root).
5. **Deploy site** par click karein!

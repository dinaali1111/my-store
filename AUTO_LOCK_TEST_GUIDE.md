## 🔒 Auto-lock Test Instructions

### الميزات المطلوبة (Required Features):

1. **⏰ Auto-lock after 10 seconds inactivity**
   - التطبيق يجب يقفل تلقائياً بعد 10 ثواني بدون لمس

2. **📱 Background lock**
   - التطبيق يجب يقفل لما يروح للخلفية (minimize app)

3. **👆 Biometric unlock**
   - فتح القفل بالبصمة أو Face ID مع fallback للباسورد

---

### 🧪 طرق الاختبار (Testing Methods):

#### Test 1: Inactivity Timeout
1. ادخل للتطبيق بالـ credentials: `dina` / `dinaali`
2. روح لتاب "Test" (الرمز 🔒)
3. اضغط "Test Auto-lock (10s)"
4. اترك التطبيق 10 ثواني بدون لمس
5. يجب يقفل تلقائياً ويظهر lock screen

#### Test 2: Background Lock
1. ادخل للتطبيق
2. اعمل minimize للتطبيق (home button أو recent apps)
3. ارجع للتطبيق
4. يجب يكون مقفول ويطلب biometric أو password

#### Test 3: Biometric Unlock
1. لما التطبيق يقفل
2. يجب يطلب biometric authentication تلقائياً
3. إذا فشل أو ضغطت "Use Password"
4. يظهر password modal
5. ادخل الباسورد `dinaali`

---

### 🔧 الكود المهم (Key Code Components):

#### 1. useAutoLock Hook
```typescript
// src/services/autoLock.ts
- يراقب user activity
- يضبط timer لـ 10 ثواني
- يراقب app state changes (background/foreground)
```

#### 2. Touch Detection
```typescript
// App.tsx
- TouchableWithoutFeedback يكشف أي touch
- resetTimer() يعيد ضبط الـ timer
```

#### 3. Lock Overlay
```typescript
// src/components/LockOverlay.tsx
- يظهر lock screen
- biometric authentication
- password fallback
```

---

### 🐛 إذا كان في مشاكل (Troubleshooting):

1. **Auto-lock مش شغال:**
   - تأكد إن user logged in
   - تأكد إن useAutoLock في App.tsx
   - تأكد إن TouchableWithoutFeedback شغال

2. **Background lock مش شغال:**
   - تأكد إن AppState listener شغال
   - تأكد إن handleAppStateChange بيتنادى

3. **Biometric مش شغال:**
   - تأكد إن expo-local-authentication مثبت
   - تأكد إن الجهاز يدعم biometrics
   - تأكد إن biometricAuth service شغال

---

### 📋 شيك ليست التجربة (Testing Checklist):

- [ ] Login بـ dina/dinaali يشتغل
- [ ] Auto-lock بعد 10 ثواني يشتغل
- [ ] Background lock يشتغل
- [ ] Biometric unlock يشتغل
- [ ] Password fallback يشتغل
- [ ] Touch events تعيد ضبط timer
- [ ] AppState changes تقفل التطبيق

---

### 🚀 للتشغيل (To Run):

```bash
cd "d:\MY FILES\After ITI\Set-Of-My-Projects\task\my-store"
npm start
# أو
npx expo start
```

### 📱 على الجهاز:
- روح لتاب "Test" (🔒)
- جرب الاختبارات
- شوف الـ logs في console
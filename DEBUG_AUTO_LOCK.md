## 🔧 Auto-lock Debug Instructions

### المشكلة: لا يقفل بعد 10 ثواني

### 🧪 خطوات الاختبار المفصلة:

1. **تشغيل التطبيق:**
   ```bash
   cd "d:\MY FILES\After ITI\Set-Of-My-Projects\task\my-store"
   npm start
   ```

2. **تسجيل الدخول:**
   - Username: `dina`
   - Password: `dinaali`

3. **فتح Developer Console:**
   - في المتصفح: F12 → Console
   - أو في Terminal إذا كنت تستخدم Metro

4. **روح لتاب "Test" (🔒):**
   - يجب تشوف logs في console تقول:
   - `🔄 Auth state changed - authenticated: true locked: false`
   - `⏰ Starting auto-lock timer`

5. **اضغط "Force Start Timer":**
   - يجب تشوف:
   - `🚀 startAutoLock called - authenticated: true locked: false`
   - `✅ Conditions met - starting auto-lock timer`
   - `⏰ Timer started - will lock in 10 seconds`

6. **اترك التطبيق 10 ثواني بدون لمس:**
   - لا تلمس الشاشة نهائياً
   - بعد 10 ثواني تماماً يجب تشوف:
   - `🔒 Auto-locking after 10 seconds of inactivity`
   - وتظهر شاشة القفل

### 🐛 إذا لم يعمل:

#### Check 1: Console Logs
شوف في console إذا كان في:
- ✅ `Timer started - will lock in 10 seconds`
- ❌ إذا مفيش الرسالة دي، معناها Timer مش بادئ

#### Check 2: Auth State
شوف في console:
- ✅ `authenticated: true locked: false`
- ❌ إذا authenticated: false → مشكلة في login
- ❌ إذا locked: true → التطبيق مقفول بالفعل

#### Check 3: Touch Events
لما تلمس الشاشة يجب تشوف:
- ✅ `📱 User touched screen`
- ✅ `👆 User activity detected - resetting timer`

### 🔧 إصلاحات إضافية:

إذا مازال لا يعمل، جرب:

1. **Clear Metro Cache:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Hard Reload:**
   - في المتصفح: Ctrl+Shift+R
   - في الموبايل: Shake device → Reload

3. **Manual Timer Test:**
   - اضغط "Force Start Timer" في تاب Test
   - انتظر 10 ثواني بالظبط
   - راقب console logs

### 📱 Expected Behavior:
- لما تدخل التطبيق → Timer يبدأ تلقائياً
- لما تلمس الشاشة → Timer يعيد ضبط نفسه
- بعد 10 ثواني بدون لمس → يقفل تلقائياً
- Console logs واضحة لكل خطوة

### 🆘 إذا مازال لا يعمل:
تأكد من إن Metro bundler شغال ومفيش errors في console
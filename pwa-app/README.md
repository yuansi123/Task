# 🍭 每日小確幸 PWA 部署指南

哈囉！這是一個可以裝到 iPhone 主畫面的可愛任務追蹤 app。
資料存在你自己的手機裡，**不會消耗 Claude 用量**，也不需要任何後端。

---

## 🚀 部署到 Vercel（最簡單，10 分鐘）

### 第一次設定（只需做一次）

1. **註冊 Vercel 帳號**
   - 到 https://vercel.com/signup
   - 用 GitHub / Google / Email 註冊都可以（免費）

2. **註冊 GitHub 帳號**（如果還沒有）
   - 到 https://github.com/signup
   - 之後程式碼會放在這裡

### 上傳程式碼

3. **建立新的 GitHub repo**
   - 登入 GitHub → 右上角「+」→「New repository」
   - 名稱隨便取，例如 `daily-tasks`
   - 設成 Public（免費方案需要）
   - 點「Create repository」

4. **上傳這個資料夾的所有檔案**
   - 在剛建立的 repo 頁面，點「uploading an existing file」
   - 把這個 zip 解壓縮後的**所有檔案**拖進去
     （注意：是裡面的檔案，不是整個資料夾）
   - 點底下「Commit changes」

### 部署

5. **連到 Vercel**
   - 到 https://vercel.com/new
   - 選你剛剛建的 repo，點「Import」
   - 全部用預設值，點「Deploy」
   - 等 1–2 分鐘 ☕

6. **完成！**
   - Vercel 會給你一個網址，例如 `daily-tasks-xxx.vercel.app`
   - 點進去看看，如果一切正常，就成功啦

---

## 📱 加到 iPhone 主畫面

1. iPhone 用 **Safari** 打開你的 Vercel 網址（必須是 Safari，Chrome 不行）
2. 點底部**分享按鈕**（方框往上的箭頭 ⬆️）
3. 滑下去找「**加入主畫面**」
4. 改名字（例如「小確幸」），點「加入」
5. 主畫面就有 icon 啦！點開就是 app 體驗，沒有 Safari 的網址列

---

## 🔄 之後想改東西？

- 直接在 GitHub 上編輯檔案，存檔後 Vercel 會自動重新部署
- 或者把改好的檔案重新上傳

---

## ⚠️ 已知限制（誠實說明）

| 功能 | 狀況 |
|---|---|
| 任務打勾、日曆、週日總結 | ✅ 完全正常 |
| 11:30 睡前提醒 | ⚠️ 只有「打開 app 時」才會顯示橫幅。iOS 的 PWA 不支援背景推播，要真的在 11:30 跳通知必須做成原生 app |
| 資料儲存 | ✅ 存在 iPhone 本地。**注意：清除 Safari 資料或重灌 app 會不見** |
| 離線使用 | ✅ 第一次打開後就能離線用 |

如果想要真正的 11:30 推播通知，可以：
- 在 iPhone 內建「捷徑」app 設一個每天 11:30 的鬧鐘 / 提醒
- 或之後再升級成原生 app

---

## 🛠️ 如果想本機測試（選用）

```bash
npm install
npm run dev    # 開發模式
npm run build  # 打包
```

需要 Node.js 18+。

---

有問題隨時回來問 Claude～祝使用愉快！🌸

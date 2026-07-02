# Coffee Ship

像素風咖啡廳小遊戲。玩家可以建立分身、走動、點咖啡、坐下，並在船上留言板留下訊息。

## 檔案

- `index.html`：網頁入口
- `style.css`：畫面樣式
- `game.js`：遊戲邏輯與留言板邏輯
- `firebase-config.js`：雲端留言板設定

## 重要：要讓不同裝置看到同一個留言板

這版已經寫好 Firebase Realtime Database 的程式，但你需要把自己的 Firebase 設定貼到 `firebase-config.js`。

### 1. 建立 Firebase 專案

1. 到 Firebase Console
2. 建立專案，例如 `coffee-ship`
3. 新增 Web App
4. 複製 Firebase 提供的 `firebaseConfig`
5. 貼到 `firebase-config.js`

### 2. 開啟 Realtime Database

1. Firebase 左側選單選 `Realtime Database`
2. 建立資料庫
3. 先選測試模式
4. 規則可先用下面這份：

```json
{
  "rules": {
    "coffeeShip": {
      "messages": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

這樣不同裝置打開同一個 GitHub Pages 網址，就會看到同一批留言。

## GitHub Pages

請把 GitHub Pages 設定成：

- Branch: `main`
- Folder: `/root`

網站網址通常會是：

```text
https://你的帳號.github.io/Coffee-ship/
```

## 注意

上面的資料庫規則是測試用，任何人都可以讀寫。正式公開前，應該加上防洗版、字數限制、簡單審核或登入機制。

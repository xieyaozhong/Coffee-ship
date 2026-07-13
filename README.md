# Coffee Ship

像素風咖啡廳小遊戲。這版已加入 Firebase Realtime Database：

- 雲端留言板：不同裝置打開同一個 GitHub Pages 網址，都能看到同一批留言。
- 基本多人同步：不同玩家進入後，會同步顯示在咖啡廳裡。
- Momo 店長 NPC：在吧台附近移動，可以幫玩家點不同咖啡。
- Peak 大提琴 NPC：可互動並播放簡易大提琴音色。
- Bean 講笑話 NPC：靠近互動會說笑話。
- NPC 會移動、碰撞、偶爾出現心情泡泡。

## 新版遊戲核心

目前介面與遊戲已收斂為「夜航咖啡船」主循環：

```text
咖啡廳準備 → 船員任務 → 甲板探索／釣魚 → 貨艙與珍珠 → 航程結算 → 解鎖新航線
```

- `coffee-ship-voyage-core.js`：航程、目標、聲望、航線與持久狀態。
- `coffee-ship-world-renderer.js`：咖啡廳、甲板、港口與角色的統一可見建模。
- `coffee-ship-game-redesign.css`：航程 HUD、日誌、世界畫布與響應式遊戲介面。
- `coffee-ship-fish-pixel-icons.js`：為每個魚種即時生成穩定且獨特的 24×24 像素圖示。
- `coffee-ship-item-pixel-icons.js`：為物品生成獨特像素圖示，並讓同系列漂流瓶共用固定瓶身。
- `coffee-ship-event-effects.js`：依事件 ID 與名稱生成專屬色調、粒子、紋理與登場動態。
- 舊版公開 API、DOM ID 與事件仍保留，讓釣魚、背包、特殊事件和多人功能可以漸進遷移。

## 上傳到 GitHub Pages

把以下檔案放在 repository 根目錄：

```text
index.html
style.css
game.js
firebase-config.js
README.md
```

GitHub Pages 設定：

- Source: Deploy from a branch
- Branch: main
- Folder: /root

網站網址：

```text
https://xieyaozhong.github.io/Coffee-ship/
```

## Firebase Realtime Database Rules

測試期可以先用：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

正式公開前建議改成需要登入或加上寫入限制，避免任何人亂寫資料。


## Firebase 留言板

這版已把 Coffee Ship 的留言板改成 Firebase Realtime Database：

- 路徑：`coffeeShip/messages`
- 每則留言包含：`name`、`text`、`clientCreatedAt`、`createdAt`
- 不同裝置開同一個 GitHub Pages 網址會即時同步留言
- 若送出失敗，請到 Firebase Realtime Database → Rules 暫時使用：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

公開測試完建議再改成需要登入或更嚴格的規則。

# Coffee Ship

像素風咖啡船小遊戲。

## 這版優化內容

- 以 `coffee_ship_momo_manager` 為基底優化
- NPC 有碰撞體積，玩家不能穿過 NPC
- Momo 是金髮店長，會在吧台附近移動並點咖啡
- Peak 是大提琴 NPC，靠近按 E 會演奏合成大提琴聲
- Bean 是講笑話 NPC，靠近按 E 會講笑話
- Peak / Bean 會在各自區域移動
- NPC 會隨機互動、偶爾出現心情泡泡
- NPC 畫面只顯示名字
- 保留留言板與 Firebase 雲端留言功能

## 操作

- WASD / 方向鍵：移動
- C：靠近 Momo 點咖啡
- E：互動或坐下
- B：打開留言板
- Space：發表情

## Firebase

若要跨裝置同步留言，請把 Firebase Realtime Database 設定填入 `firebase-config.js`。

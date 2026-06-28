const express = require('express');
const initialMembers = require('../fixtures/members.json');

// ⚠️ 寫作業前先 `npm start` 打開 http://localhost:3000/docs 看 Swagger UI 的規格。
// 💡 /* 作答區 ... */ 是答題提示區，取消註解後填入你的程式碼。

// ───────────────────────────────────────────────────────────
// TODO 任務一：初始化 state + 內部 helpers
// ───────────────────────────────────────────────────────────

// 1. 複製 initialMembers，不直接改外部陣列
// 作答區
const members = [
  { "id": 1, "name": "小華", "level": "VIP" },
  { "id": 2, "name": "小美", "level": "normal" },
  { "id": 3, "name": "阿強", "level": "VIP" },
  { "id": 4, "name": "小明", "level": "normal" }
];


// 2. 下一個新增會員要使用的 id
// 作答區
let nextId = 5;


// 3. 兩個內部 helper 函式

// 函式一：filterByQuery(list, query)：
// - 依據 query.level 篩選，沒帶就回全部
// - 任務二的 GET / 會使用到這個函式
// 作答區
function filterByQuery(list, query) { 
    // 輸入參數 list [{id,name,level}, {id,name,level}]
    // 輸入參數 VIP or normal
    const result = list.filter( item => item.level === query);
    // 如果篩選成功就回傳篩選的陣列 | 如果為 false 則回傳原 list
    return result.length > 0 ? result : list; 
 }


// 函式二：validateBody(body)
// - 驗證 body 有沒有 name、level 欄位，要擋 null / undefined / {}
// - 驗證通過 → { valid: true }
// - 驗證失敗 → { valid: false, error: '缺 name 或 level' }
// - 任務三的 POST / 會使用到這個函式
// 作答區
function validateBody(body) { 
    const standard = ['name', 'level'];
    const result = standard.filter(item => !body[item]); // 有缺才會 filter 出來
    /* 
    假設有缺 console.log( validateBody({'name':'小名'}) ) -> 結果 ['level']
    */
    if(result.length > 0){ // 驗證失敗
        return {
            valid: false, 
            error: '缺 name 或 level'
        };
    };
    return { valid: true }; // 驗證通過
 }

// test
// const example = { 'name':'小花', 'level':'5'};
// console.log( validateBody(example));


const router = express.Router();
// 此 router 掛在 app.js 的 '/members'，以下路由皆帶此前綴。舉例來說：
// - router.get('/') → GET /members
// - router.get('/:id') → GET /members/:id

// ───────────────────────────────────────────────────────────
// TODO 任務二：GET / 和 GET /:id
// ───────────────────────────────────────────────────────────

// GET /
// - 輸入：req.query.level 可帶 'VIP' | 'normal'（選填）
// - 輸出：200 + [{ id, name, level }, ...]
// - 提示：filterByQuery(members, req.query)
// 作答區
router.get('/', (req, res) => { 
    const memberLevelOptional = req.query.level;
    const result = filterByQuery(members, memberLevelOptional);
    res.status(200).json(result);
 });


// GET /:id
// - 輸入：req.params.id（string，需使用 Number() 轉換）
// - 輸出：200 + { id, name, level }，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.find，找不到時結果是 undefined
// 作答區
router.get('/:id', (req, res) => { 
    const inputId = Number(req.params.id);
    const result = members.find( item => item.id === inputId); // 找到會回傳值，找不到會回傳 undefined
    if( !result ){
        res.status(404).json({ error: '會員不存在' });
        return;
    }
    res.status(200).json(result);
 });


// ───────────────────────────────────────────────────────────
// TODO 任務三：POST /
// ───────────────────────────────────────────────────────────

// POST /
// - 輸入：body = { name: string, level: 'VIP' | 'normal' }
// - 輸出：201 + 新會員物件（id 自動配），或 400 + { error: '缺 name 或 level' }（驗證失敗）
// - 提示：validateBody(req.body) 驗證；通過後用 spread 將 req.body 的欄位與 nextId 自動遞增的 id 合為新物件，push 進 members
// - 範例：POST /members body { name: '阿文', level: 'VIP' } → 201 { id: 5, name: '阿文', level: 'VIP' }
// 作答區
router.post('/', (req, res) => { 
    const validateResult = validateBody(req.body);
    if(!validateResult.valid){
        res.status(400).json( { error: '缺 name 或 level' } );
        return;
    }

    const newMember = { 'id': nextId++, ...req.body };
    members.push(newMember);
    res.status(201).json(newMember);
 });


// ───────────────────────────────────────────────────────────
// TODO 任務四：PUT /:id 和 DELETE /:id
// ───────────────────────────────────────────────────────────

// PUT /:id
// - 輸入：req.params.id（string，需 Number() 轉換）、body（部分欄位，例如只傳 { level: 'normal' }）
// - 輸出：200 + merge 後的會員，或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則使用 spread 合併 members[idx] 與 req.body（req.body 需注意順序來覆蓋舊欄位），最後將結果存回 members[idx]
// - 範例：PUT /members/1 body { level: 'normal' } → 200 { id: 1, name: '小華', level: 'normal' }（name 被保留）
// 作答區
router.put('/:id', (req, res) => { 
    const inputId = Number(req.params.id);
    const result = members.find( item => item.id === inputId); // 找到會回傳值，找不到會回傳 undefined
    if( !result ){
        res.status(404).json({ error: '會員不存在' });
        return;
    }

    const memberIndex = members.findIndex(item => item.id === inputId);
    const updatedMember = { ...members[memberIndex], ...req.body } // 重疊的物件屬性（如：name、level）會被後面的 ... 覆蓋掉
    members[memberIndex] = updatedMember;
    res.status(200).json(updatedMember); // 更新後的該會員資料


 });


// DELETE /:id
// - 輸入：req.params.id（string，需 Number() 轉換）
// - 輸出：204（無 body），或 404 + { error: '會員不存在' }（找不到時）
// - 提示：members.findIndex 找索引，-1 回應 404；找到索引則 splice 移除，再設定 status 204 並以 .end() 結束回應（204 不帶 body）
// 作答區
router.delete('/:id', (req, res) => { 
    const inputId = Number(req.params.id);
    const result = members.find( item => item.id === inputId); // 找到會回傳值，找不到會回傳 undefined
    if( !result ){
        res.status(404).json({ error: '會員不存在' });
        return;
    }

    const memberIndex = members.findIndex(item => item.id === inputId);
    members.splice(memberIndex, 1);
    res.status(204);
    res.end();

 });


module.exports = router;

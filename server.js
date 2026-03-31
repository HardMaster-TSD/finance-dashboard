const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = '/Users/tangshengda/.openclaw/workspace/agents/finance-head/data/expenses';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 获取月度数据
app.get('/api/expenses/:month', (req, res) => {
  const { month } = req.params;
  const filePath = path.join(DATA_DIR, `${month}.json`);
  
  if (!fs.existsSync(filePath)) {
    return res.json({ month, expenses: [], total: 0, categories: {} });
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
});

// 获取所有月份
app.get('/api/months', (req, res) => {
  if (!fs.existsSync(DATA_DIR)) {
    return res.json([]);
  }
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const months = files.map(f => f.replace('.json', '')).sort().reverse();
  res.json(months);
});

// 添加消费记录
app.post('/api/expenses/:month', (req, res) => {
  const { month } = req.params;
  const { date, amount, category, desc, note } = req.body;
  const filePath = path.join(DATA_DIR, `${month}.json`);
  
  let data = { month, expenses: [], total: 0, categories: {} };
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  const expense = { date, amount: parseFloat(amount), category, desc, note: note || '' };
  data.expenses.push(expense);
  data.total += expense.amount;
  data.categories[category] = (data.categories[category] || 0) + expense.amount;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`\n💰 Finance Dashboard 已启动\n📺 http://localhost:${PORT}\n`);
});

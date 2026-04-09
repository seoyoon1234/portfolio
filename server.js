const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // JSON 요청 바디 파싱
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일(HTML, CSS, JS) 제공

// 임시 데이터베이스 역할을 할 배열
let posts = [
    { id: 1, title: '첫 번째 글', content: '디자인 정말 멋지네요!' }
];
let nextId = 2;

// 1. 게시글 목록 조회 API
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// 2. 게시글 작성 API
app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });

    const newPost = { id: nextId++, title, content };
    posts.unshift(newPost); // 최신 글이 위로 오도록 배열 맨 앞에 추가
    res.status(201).json(newPost);
});

// 3. 게시글 삭제 API
app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    posts = posts.filter(post => post.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`🚀 서버가 시작되었습니다: http://localhost:${PORT}`);
});
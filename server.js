const express = require('express');
const cors = require('cors'); // ⭐️ CORS 모듈 불러오기
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// ⭐️ 모든 도메인에서 내 서버로 접속할 수 있게 허용!
app.use(cors()); 

app.use(express.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'posts.json');

async function getPosts() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function savePosts(posts) {
    await fs.writeFile(dataFile, JSON.stringify(posts, null, 2), 'utf8');
}

app.get('/api/posts', async (req, res) => {
    const posts = await getPosts();
    res.json(posts);
});

app.post('/api/posts', async (req, res) => {
    const posts = await getPosts();
    const { title, content } = req.body;
    const maxId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) : 0;
    const newPost = { id: maxId + 1, title, content };
    
    posts.unshift(newPost);
    await savePosts(posts);
    res.status(201).json(newPost);
});

app.put('/api/posts/:id', async (req, res) => {
    const posts = await getPosts();
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex !== -1) {
        posts[postIndex] = { id, title, content };
        await savePosts(posts);
        res.json({ message: '수정 완료', post: posts[postIndex] });
    } else {
        res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    let posts = await getPosts();
    const id = parseInt(req.params.id);
    posts = posts.filter(p => p.id !== id);
    await savePosts(posts);
    res.json({ message: '삭제 완료' });
});

app.listen(port, () => {
    console.log(`백엔드 서버 실행 중! 포트: ${port}`);
});
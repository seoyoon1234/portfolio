const express = require('express');
const fs = require('fs').promises; // 파일 읽기/쓰기를 위한 기본 모듈
const path = require('path');
const app = express();
const port = 3000;

// 클라이언트에서 보내는 JSON 데이터를 읽기 위한 설정
app.use(express.json());

// 'public' 폴더 안의 HTML, CSS, JS 파일들을 정적 파일로 제공
app.use(express.static('public'));

// 데이터를 저장할 파일 경로 설정
const dataFile = path.join(__dirname, 'posts.json');

// 📥 데이터 읽기 함수 (파일에서 게시글 불러오기)
async function getPosts() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // 파일이 아직 없으면 빈 배열 반환
        return [];
    }
}

// 📤 데이터 저장 함수 (파일에 게시글 덮어쓰기)
async function savePosts(posts) {
    await fs.writeFile(dataFile, JSON.stringify(posts, null, 2), 'utf8');
}

// 1. 게시글 목록 조회 (GET)
app.get('/api/posts', async (req, res) => {
    const posts = await getPosts();
    res.json(posts);
});

// 2. 게시글 작성 (POST)
app.post('/api/posts', async (req, res) => {
    const posts = await getPosts();
    const { title, content } = req.body;
    
    // 가장 큰 ID를 찾아서 + 1 (새로운 게시글 ID 부여)
    const maxId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) : 0;
    const newPost = { id: maxId + 1, title, content };
    
    posts.unshift(newPost); // 배열의 맨 앞에 추가 (최신순)
    await savePosts(posts); // ⭐️ 파일에 진짜 저장!
    
    res.status(201).json(newPost);
});

// 3. 게시글 수정 (PUT)
app.put('/api/posts/:id', async (req, res) => {
    const posts = await getPosts();
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex !== -1) {
        posts[postIndex] = { id, title, content };
        await savePosts(posts); // ⭐️ 수정된 내용 파일에 저장!
        res.json({ message: '수정 완료', post: posts[postIndex] });
    } else {
        res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
});

// 4. 게시글 삭제 (DELETE)
app.delete('/api/posts/:id', async (req, res) => {
    let posts = await getPosts();
    const id = parseInt(req.params.id);
    
    // 삭제할 ID를 제외한 나머지 게시글만 남기기
    posts = posts.filter(p => p.id !== id);
    await savePosts(posts); // ⭐️ 삭제된 상태를 파일에 저장!
    
    res.json({ message: '삭제 완료' });
});

// 🚀 서버 시작
app.listen(port, () => {
    console.log(`서버가 정상적으로 실행되었습니다!`);
    console.log(`👉 http://localhost:${port} 로 접속해보세요.`);
});
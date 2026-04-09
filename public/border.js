const API_URL = '/api/posts';

// 페이지가 로드되면 게시글 목록 불러오기
document.addEventListener('DOMContentLoaded', fetchPosts);

// 1. 게시글 목록 가져오기
async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('게시글을 불러오는 중 오류 발생:', error);
    }
}

// 2. 화면에 게시글 그리기
function renderPosts(posts) {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        // 클릭 시 모달 열기
        postElement.onclick = () => openModal(post.title, post.content);

        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <button class="delete-btn" onclick="event.stopPropagation(); deletePost(${post.id})">❌ 삭제</button>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        postList.appendChild(postElement);
    });
}

// 3. 게시글 작성하기
async function createPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요!');
        return;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        // 입력창 초기화 및 목록 갱신
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        fetchPosts();
    } catch (error) {
        console.error('작성 오류:', error);
    }
}

// 4. 게시글 삭제하기
async function deletePost(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchPosts(); // 삭제 후 목록 갱신
    } catch (error) {
        console.error('삭제 오류:', error);
    }
}

// 5. 모달 제어
function openModal(title, content) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalContent').innerText = content;
    document.getElementById('postModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('postModal').style.display = 'none';
}

// 모달 바깥 영역 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('postModal');
    if (event.target == modal) {
        closeModal();
    }
}
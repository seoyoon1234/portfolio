/* ==================================
   1. Typing & Animation (기존과 동일)
================================== */
const text = ["안녕하세요.", "정보보안에 관심을 가지고 있는 고등학생입니다.", "웹, 앱 개발을 통해 정보보안을 공부하고 있습니다."];
let index = 0; let charIndex = 0;
function type() {
  const typing = document.getElementById("typing");
  if (!typing) return;
  if (charIndex < text[index].length) {
    typing.textContent += text[index][charIndex];
    charIndex++;
    setTimeout(type, 80);
  } else {
    setTimeout(() => {
      typing.textContent = ""; charIndex = 0; index++;
      if (index >= text.length) index = 0;
      type();
    }, 1500);
  }
}
type();

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("active");
  });
});
reveals.forEach(el => observer.observe(el));

/* ==================================
   2. API 서버 통신 로직
================================== */
// 🚨 중요: 여기에 서윤님의 실제 서버 IP나 도메인을 적어주세요! (예: http://123.45.67.89:3000/api/posts)
const API_URL = 'https://portfolio-inky-five-73.vercel.app/#board'; 
let currentPostId = null; 

document.addEventListener('DOMContentLoaded', fetchPosts);

// 목록 가져오기
async function fetchPosts() {
  try {
    const response = await fetch(API_URL);
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    console.error('불러오기 오류:', error);
  }
}

// 화면에 그리기
function renderPosts(posts) {
  const postList = document.getElementById('postList');
  if (!postList) return;
  postList.innerHTML = '';

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.onclick = () => openModal(post.id, post.title, post.content);

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

// 작성하기
async function createPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;

  if (!title || !content) return alert('모두 입력해주세요!');

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    fetchPosts();
  } catch (error) { console.error('작성 오류:', error); }
}

// 삭제하기
async function deletePost(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchPosts();
  } catch (error) { console.error('삭제 오류:', error); }
}

/* ==================================
   3. Modal 제어 및 수정 기능
================================== */
function openModal(id, title, content) {
  currentPostId = id; 
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalContent').innerText = content;
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('postModal').style.display = 'flex';
}

function closeModal() { document.getElementById('postModal').style.display = 'none'; }
window.onclick = function(e) { if (e.target == document.getElementById('postModal')) closeModal(); }

function openEditMode() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'block';
  document.getElementById('editPostId').value = currentPostId;
  document.getElementById('editPostTitle').value = document.getElementById('modalTitle').innerText;
  document.getElementById('editPostContent').value = document.getElementById('modalContent').innerText;
}

function cancelEditMode() {
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
}

// 수정 저장하기
async function saveEditPost() {
  const id = document.getElementById('editPostId').value;
  const title = document.getElementById('editPostTitle').value;
  const content = document.getElementById('editPostContent').value;

  if (!title || !content) return alert('모두 입력해주세요!');

  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    closeModal();
    fetchPosts();
  } catch (error) { console.error('수정 오류:', error); }
}
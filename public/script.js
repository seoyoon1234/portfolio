/* ==================================
   1. Typing & Animation (기존 타이핑, 스크롤 효과 유지)
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
   2. 게시판 핵심 로직 (LocalStorage 사용! DB 필요 없음!)
================================== */
let currentPostId = null; 

// 페이지가 로드되면 브라우저 저장소에서 글 불러오기
document.addEventListener('DOMContentLoaded', fetchPosts);

// 🗂️ 저장소에서 데이터 읽기 함수
function getLocalPosts() {
  const saved = localStorage.getItem('seoyoon_posts');
  return saved ? JSON.parse(saved) : [];
}

// 🗂️ 저장소에 데이터 저장 함수
function saveLocalPosts(posts) {
  localStorage.setItem('seoyoon_posts', JSON.stringify(posts));
}

// 📌 화면에 게시글 목록 그리기
function fetchPosts() {
  const posts = getLocalPosts();
  const postList = document.getElementById('postList');
  if (!postList) return;
  
  postList.innerHTML = '';

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    // 클릭 시 모달 열기
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

// 🚀 새 글 작성하기
function createPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;

  if (!title || !content) return alert('제목과 내용을 모두 입력해주세요!');

  const posts = getLocalPosts();
  // 가장 큰 ID 찾아서 +1 (새로운 글 번호 부여)
  const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
  
  // 새 글을 배열 맨 앞에 추가
  posts.unshift({ id: newId, title, content }); 
  
  // 브라우저에 저장!
  saveLocalPosts(posts);

  // 입력창 비우고 새로고침
  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
  fetchPosts();
}

// ❌ 글 삭제하기
function deletePost(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  let posts = getLocalPosts();
  // 삭제할 아이디만 빼고 다시 저장
  posts = posts.filter(post => post.id !== id);
  saveLocalPosts(posts);
  
  fetchPosts();
}

/* ==================================
   3. 모달창 및 수정/취소 기능
================================== */
// 자세히 보기 창 열기
function openModal(id, title, content) {
  currentPostId = id; 
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalContent').innerText = content;
  
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
  document.getElementById('postModal').style.display = 'flex';
}

// 창 닫기
function closeModal() { 
  document.getElementById('postModal').style.display = 'none'; 
}

// 창 바깥 클릭 시 닫기
window.onclick = function(e) { 
  if (e.target == document.getElementById('postModal')) closeModal(); 
}

// ✏️ 수정 모드로 변경
function openEditMode() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'block';

  // 기존 내용을 입력창에 넣어주기
  document.getElementById('editPostId').value = currentPostId;
  document.getElementById('editPostTitle').value = document.getElementById('modalTitle').innerText;
  document.getElementById('editPostContent').value = document.getElementById('modalContent').innerText;
}

// 🔙 수정 취소하기
function cancelEditMode() {
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
}

// 💾 수정된 내용 저장하기
function saveEditPost() {
  const id = parseInt(document.getElementById('editPostId').value);
  const title = document.getElementById('editPostTitle').value;
  const content = document.getElementById('editPostContent').value;

  if (!title || !content) return alert('제목과 내용을 모두 입력해주세요!');

  let posts = getLocalPosts();
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex !== -1) {
    posts[postIndex] = { id, title, content };
    saveLocalPosts(posts); // 브라우저에 덮어쓰기!
  }

  closeModal();  
  fetchPosts();  
}
/* ==================================
   Typing Effect 
================================== */
const text = [
  "안녕하세요.",
  "정보보안에 관심을 가지고 있는 고등학생입니다.",
  "웹, 앱 개발을 통해 정보보안을 공부하고 있습니다."
];

let index = 0;
let charIndex = 0;

function type() {
  const typing = document.getElementById("typing");
  if (charIndex < text[index].length) {
    typing.textContent += text[index][charIndex];
    charIndex++;
    setTimeout(type, 80);
  } else {
    setTimeout(() => {
      typing.textContent = "";
      charIndex = 0;
      index++;
      if (index >= text.length) {
        index = 0;
      }
      type();
    }, 1500);
  }
}
type();

/* ==================================
   Reveal Animation 
================================== */
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
});

reveals.forEach(el => {
  observer.observe(el);
});

/* ==================================
   Board & API Logic 
================================== */
const API_URL = '/api/posts';
let currentPostId = null; // 현재 자세히보기/수정 중인 게시글 ID 저장

document.addEventListener('DOMContentLoaded', fetchPosts);

// 1. 게시글 목록 가져오기
async function fetchPosts() {
  try {
    const response = await fetch(API_URL);
    // 서버가 없을 때 오류 방지를 위해, JSON 변환 전 상태 확인을 추천합니다.
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
    
    // 클릭 시 '자세히 보기' 모달 열기 (id 파라미터 추가 전달)
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
    fetchPosts();
  } catch (error) {
    console.error('삭제 오류:', error);
  }
}

/* ==================================
   Modal 제어 (자세히보기 & 수정)
================================== */

// 모달 열기 (조회 모드 기본값)
function openModal(id, title, content) {
  currentPostId = id; 
  
  // 조회용 데이터 세팅
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalContent').innerText = content;
  
  // 모드 화면 전환
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
  
  // 모달 띄우기
  document.getElementById('postModal').style.display = 'flex';
}

// 모달 닫기
function closeModal() {
  document.getElementById('postModal').style.display = 'none';
}

// 모달 바깥 클릭 시 닫기
window.onclick = function(event) {
  const modal = document.getElementById('postModal');
  if (event.target == modal) {
    closeModal();
  }
}

// '수정하기' 버튼 눌렀을 때 (수정 모드로 전환)
function openEditMode() {
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'block';

  // 현재 값을 Input에 넣어줌
  document.getElementById('editPostId').value = currentPostId;
  document.getElementById('editPostTitle').value = document.getElementById('modalTitle').innerText;
  document.getElementById('editPostContent').value = document.getElementById('modalContent').innerText;
}

// '취소' 버튼 눌렀을 때 (다시 조회 모드로 복귀)
function cancelEditMode() {
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
}

// 수정한 내용 저장 (서버로 전송)
async function saveEditPost() {
  const id = document.getElementById('editPostId').value;
  const title = document.getElementById('editPostTitle').value;
  const content = document.getElementById('editPostContent').value;

  if (!title || !content) {
    alert('수정할 제목과 내용을 모두 입력해주세요!');
    return;
  }

  try {
    // REST API 규칙에 따라 수정은 보통 PUT 또는 PATCH 메서드를 사용합니다.
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    closeModal();  // 창 닫기
    fetchPosts();  // 목록 새로고침
  } catch (error) {
    console.error('수정 오류:', error);
  }
}
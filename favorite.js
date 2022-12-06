const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const datapanel = document.querySelector('#data-panel')
const cardBody = document.querySelector('.card-body')
const paginator = document.querySelector('#paginator')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
const genderInput = document.querySelector('#gender-selector')

const datas = JSON.parse(localStorage.getItem('favoriteUser')) || []

renderUserLists(datas)

//  用戶照片
function renderUserLists(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="avatar row position-relative">
        <div class="avatar card m-3" style="width: 12rem;">
          <div class="avatar row" data-bs-toggle="modal" data-bs-target="#avatar-modal" data-id="${item.id}">
            <img src="${item.avatar}" class="avatar img-fluid rounded-circle mt-3" alt="avatar"
            data-bs-toggle="modal" data-bs-target="#avatar-modal" data-id="${item.id}">
            <div class="avatar-body text-center">
            <p class="avatar-info avatar mt-2" data-bs-toggle="modal" data-bs-target="#avatar-modal" data-id="${item.id}" data-gender="${item.gender}"> ${item.name} , ${item.age}
            </p>
            </div>
          </div>
          <div class="avatar-favorite">
            <p class="avatar-like position-absolute end-0 top-0">
                <i class="favorite-img fa-solid fa-heart" data-id="${item.id}" id="likes-img"></i>
            </p>
          </div>
        </div>
      </div>
      `
  })
  datapanel.innerHTML = rawHTML
  addGenderIcon()
}

//   新增性別圖示
function addGenderIcon() {
  const avatarInfo = document.querySelectorAll('.avatar-info')
  avatarInfo.forEach(item => {
    if (item.dataset.gender === 'male') {
      item.innerHTML +=  '<i class="male fa-solid fa-mars"></i>'
    } else {
      item.innerHTML += '<i class="female fa-solid fa-venus"></i>'
    }
  })
}

//  remove favorite
function removeFromFavorite(id) {
  const dataIndex = datas.findIndex(user => user.id === id)
  datas.splice(dataIndex, 1)
  //  datas 經過刪除後 轉為 JSON 格式 覆蓋原本的 localStorage 
  localStorage.setItem('favoriteUser', JSON.stringify(datas))
  renderUserLists(datas)
}

//  顯示 modal
function showUserModal(id) {
  const modalTitle = document.querySelector('.modal-title')
  const modalInfo = document.querySelector('.modal-info')
  const modalDetail = document.querySelector('.modal-detail')
  const modalImg = document.querySelector('.modal-img')

  modalImg.src = ''
  modalTitle.textContent = ''
  modalInfo.innerHTML = ''
  modalDetail.innerHTML = ''

  axios.get(INDEX_URL + id)
    .then((res) => {
      const user = res.data
      modalTitle.textContent = user.name + ' ' + user.surname
      modalImg.src = user.avatar
      if (res.data.gender === 'male') {
        modalInfo.innerHTML = `
    <p>${user.name} , ${user.age} <i class="male fa-solid fa-mars"></i></p>`
      } else {
        modalInfo.innerHTML = `
    <p>${user.name} , ${user.age} <i class="female fa-solid fa-venus"></i></p>`
      }
      modalDetail.innerHTML = `
    <p>Region: ${user.region}</p>
    <p>Birthday: ${user.birthday}</p>
    <p>Email: ${user.email}</p>
      `
    })
}

//  點擊card時 更新個人 modal-info
datapanel.addEventListener('click', function personalInfo(event) {
  const target = event.target
  if (target.matches('.avatar')) {
    showUserModal(Number(target.dataset.id))
  } else if (target.matches('.favorite-img')) {
    if (target.matches('.fa-regular')) {
      target.classList.replace('fa-regular', 'fa-solid')
    } else if (target.matches('.fa-solid')) {
      target.classList.replace('fa-solid', 'fa-regular')
    }
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

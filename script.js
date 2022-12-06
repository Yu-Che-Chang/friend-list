const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const datapanel = document.querySelector('#data-panel')
const cardBody = document.querySelector('.card-body')
const paginator = document.querySelector('#paginator')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
const genderInput = document.querySelector('#gender-selector')


const datas = []
let filterUserLists = []
// 把 favoriteUser　JSON格式 換成 javascript 
const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
const LIST_PER_PAGE = 12

axios.get(INDEX_URL)
  .then((res) => {
    datas.push(...res.data.results)
    renderPaginator(datas.length)
    renderUserLists(getListsByPages(1))
    colorTheHeart()
    addGenderIcon()
  })
  .catch((err) => console.log(err))

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
                <i class="favorite-img fa-regular fa-heart" data-id="${item.id}" id="likes-img"></i>
            </p>
          </div>
        </div>
      </div>
      `
  })
  datapanel.innerHTML = rawHTML
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
      if (user.gender === 'male') {
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
    addToFavorite(Number(event.target.dataset.id))
  }
})

//  增加到 favoriteList
function addToFavorite(id) {

  //  點選愛心時 顯示電影資料
  const data = datas.find(user => user.id === id)

  //  若 localStorage 有存取過相同 data 時
  //  點按即可取消 favorite
  if (list.some(data => data.id === id)) {
    let dataIndex = list.findIndex(user => user.id === id)
    list.splice(dataIndex, 1)
    localStorage.setItem('favoriteUser', JSON.stringify(list))
  } else {
    list.push(data)
    localStorage.setItem('favoriteUser', JSON.stringify(list))
  }
}


//  已新增至 favorite 的 user 愛心是亮的
function colorTheHeart() {
  const heartIcon = document.querySelectorAll('.favorite-img.fa-heart')

  if (list.length > 0) {
    heartIcon.forEach((user) => {
      list.find((data) => {
        if (Number(data.id) === Number(user.dataset.id)) {
          user.classList.replace('fa-regular', 'fa-solid') // 正確  
        }
      })
    })
  }
}

// 15per/page => 分頁顯示器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / LIST_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
      `
  }
  paginator.innerHTML = rawHTML
}

//  設定資料分頁
function getListsByPages(page) {
  const data = filterUserLists.length ? filterUserLists : datas

  const startIndex = (page - 1) * LIST_PER_PAGE
  return data.slice(startIndex, startIndex + LIST_PER_PAGE)
}

//  設定分頁監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderUserLists(getListsByPages(page))
  colorTheHeart()
  addGenderIcon()
})

//  設定搜尋欄
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  //  統一小寫去除空格
  const keyword = searchInput.value.trim().toLowerCase()
  //  如果有其他篩選條件 則採用 filterUserLists
  const searchData = filterUserLists.length ? filterUserLists : datas

  //  姓氏 or 名字符合關鍵字 列入 filterUserLists
  filterUserLists = searchData.filter(list =>

    list.name.toLowerCase().includes(keyword) ||
    list.surname.toLowerCase().includes(keyword))

  renderPaginator(filterUserLists.length)
  renderUserLists(getListsByPages(1))
  colorTheHeart()
  addGenderIcon()
})

//  選擇戀愛取向
genderInput.addEventListener('change', function onGenderSelect(event) {
  const switchValue = genderInput.value
  const filterData = filterUserLists.length ? filterUserLists = datas : datas
  //  switch 語法
  switch (switchValue) {
    case "1":
      filterUserLists = filterData
      break;
    case "2":
      filterUserLists = filterData.filter(list => list.gender === 'female')
      break;
    case "3":
      filterUserLists = filterData.filter(list => list.gender === 'male')
      break;
  }
  renderPaginator(filterUserLists.length)
  renderUserLists(getListsByPages(1))
  colorTheHeart()
  addGenderIcon()
})


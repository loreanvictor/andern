import { get } from 'json-pointer'
import { createRoot } from '../src'

const root = {
  a: 1,
  b: {
    c: 1,
    d: 1,
  },
  e: [1, {
    f: 1,
    g: { h: 1 },
  }, 1],
}

const node = createRoot(root)

const render = (obj, path = '') => {
  let res

  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    res = `
      <div class='circle' path=${path}></div>
      <div class='dongle'></div>
      <div class='children'>
        <div class='child-connector'></div>
        ${keys.map(key => render(obj[key], `${path}/${key}`)).join('')}
      </div>
    `
  } else {
    res = `<div class='circle leaf' path=${path}>${obj}</div>`
  }

  if (path === '') {
    return `<div class='node'>${res}</div>`
  } else {
    return `<div class='node'><div class='dongle'></div>${res}</div>`
  }
}

document.querySelector('main').innerHTML = render(root)
document.querySelectorAll('.circle').forEach(el => {
  const path = el.getAttribute('path')

  node.read(path).subscribe((v) => {
    el.classList.add('changed')
    setTimeout(() => {
      el.classList.remove('changed')
    }, 100)

    if (typeof v !== 'object') {
      el.innerHTML = v
    }
  })

  el.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    const target = get(root, path)
    if (typeof target === 'object') {
      node.set(path, target)
    } else {
      node.set(path, target + 1)
    }
  })
})

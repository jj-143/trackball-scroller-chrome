
var storageSetting

function loadSetting () {

  chrome.storage.sync.get('setting', ({ setting }) => {

    storageSetting = setting

    document.getElementById("mbutton-activation").value = setting.buttonActivation
    document.getElementById("scroll-direction").checked = setting.isNaturalScrolling
    document.getElementById("key-activation").value = setting.keyActivation
    document.getElementById("key-non-activation").value = setting.keyNonActivation
    })
}

function setValue(key, value) {
  // only set value, change ext's setting is up to caller to this.

  storageSetting = {
    ...storageSetting,
    [key]: value
  }

  chrome.storage.sync.set({ setting: storageSetting })
}

function attachEvents() {
  document.getElementById("mbutton-activation").addEventListener('change', e => {
    const value = e.target.value
    setValue('buttonActivation', value)
  })
  document.getElementById("key-activation").addEventListener('change', e => {
    const value = e.target.value
    setValue('keyActivation', value)
  })
  document.getElementById("key-non-activation").addEventListener('change', e => {
    const value = e.target.value
    setValue('keyNonActivation', value)
  })

  document.getElementById("scroll-direction").addEventListener('change', e => {
    const value = e.target.checked
    setValue('isNaturalScrolling', value)
  })

  console.log('options - event attached')
}



loadSetting()
attachEvents()

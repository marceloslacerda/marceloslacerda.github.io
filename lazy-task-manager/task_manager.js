function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

function saveItem(key, item) {
    if(item === null) {
        console.warn('Attemting to store null ' + key)
    }
    window.localStorage.setItem(key, JSON.stringify(item))
}

function restoreItem(key, defaultValue) {
    const r = JSON.parse(localStorage.getItem(key))
    if(r === null) return defaultValue
    else return r
}

function setStatus(text) {
    STATUS_FIELD.innerText = text
}

function setupUI() {
    IMPORT_BUTTON.onchange = (evt => {
        evt.target.files[0].text().then(text => manager.importTasks(text))
    })
    EXPORT_BUTTON.onclick=(evt=>manager.exportTasks())
    GET_TASK_BUTTON.onclick=(evt=> {
        const task = manager.getTask()
        if(task === null) setStatus("No tasks left to do! Time to take a break!")
        else {
            OLD_TITLE_FIELD.innerText = task.title
            OLD_COMMENTS_FIELD.innerText = task.comments
            DONE_TASK_BUTTON.hidden = false
        }
    })
    DONE_TASK_BUTTON.onclick=(evt=> {
        manager.completeCurrentTask()
        setStatus("Task done!")
        OLD_TITLE_FIELD.innerText = ""
        OLD_COMMENTS_FIELD.innerText = ""
        DONE_TASK_BUTTON.hidden = true
    })
}

function addTask(e) {
    e.preventDefault();
    const title = NEW_TITLE_FIELD.value
    manager.addTask(title, NEW_COMMENTS_FIELD.value)
    setStatus("Successfuly added task: " + title)
    NEW_TITLE_FIELD.value = ""
    NEW_COMMENTS_FIELD.value = ""
    manager.saveTasks()
    NEW_TITLE_FIELD.focus()
    return false;
}

function identifyDevice() {
    let device, browser
    if(/android/i.test(navigator.userAgent)) {
        device = "android"
    } else if(/iphone/i.test(navigator.userAgent)) {
        device = "iphone"
    } else if(/ipad/i.test(navigator.userAgent)) {
        device = "ipad"
    } else if(/windows/i.test(navigator.userAgent)) {
        device = "windows"
    } else if(/linux/i.test(navigator.userAgent)) {
        device = "linux"
    } else if(/cros/i.test(navigator.userAgent)) {
        device = "cros"
    } else {
        device = "unknown-device"
    }
    
    if(/firefox/i.test(navigator.userAgent)) {
        browser = "firefox"
    } else if(/chrome/i.test(navigator.userAgent)) {
        browser = "chrome"
    } else if(/safari/i.test(navigator.userAgent)) {
        browser = "safari"
    } else if(/edge/i.test(navigator.userAgent)) {
        browser = "edge"
    } else if(/opera/i.test(navigator.userAgent)) {
        browser = "opera"
    } else if(/brave/i.test(navigator.userAgent)) {
        broser = "brave"
    } else {
        browser = "unknown-browser"
    }
    return device + "-" + browser
}

class Task {
    constructor(title, comments) {
        this.title = title
        this.comments = comments
        this.currentTask = null
    }
}

class TaskManager {
    constructor() {
        this.waiting = []
        this.done = []
    }
    addTask(title, comments) {
        this.waiting.push(new Task(title, comments))
    }

    getTask() {
        if(this.waiting.length == 0) {
            return null
        } else {
            this.currentTask = this.waiting[getRandomInt(this.waiting.length)]
            return this.currentTask
        }
    }
    completeCurrentTask() {
        const idx = this.waiting.indexOf(this.currentTask)
        if(idx == -1) {
            console.warn('Task is not in the waiting list')
            return
        }
        this.waiting.splice(idx, 1)
        this.done.push(this.currentTask)
    }
    getCompletedTasks() {
        return this.done
    }
    saveTasks() {
        saveItem(STORAGE_KEY, this.getState())
    }
    getState() {
        return {waiting: this.waiting, done: this.done, currentTask: this.currentTask}
    }
    restoreTasks() {
        const state = restoreItem(STORAGE_KEY, this.getState())
        this.waiting = state.waiting
        this.done = state.done
        this.currentTask = state.currentTask
        if(this.waiting.length != 0 || this.waiting.length != 0) setStatus("Some tasks were restored")
    }
    exportTasks() {
        const data = JSON.stringify(this.getState())
        // Function to download data to a file
        const file = new Blob([data], {type: "application/json"})
        const a = document.createElement("a"),
            url = URL.createObjectURL(file)
        a.href = url
        const now = new Date().toISOString()
        a.download = "exported-tasks-"+  now + "-"+ identifyDevice() + ".json"
        document.body.appendChild(a)
        a.click()
        setTimeout(function() {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0)
        setStatus("Task list exported")
    }
    importTasks(text) {
        const state = JSON.parse(text)
        let added = 0
        for(const attr of ['done', 'waiting']) {
            for(const task of state[attr]) {
                if(state[attr].indexOf(task) == -1) {
                    state[attr].push(task)
                    added++
                }
            }
        }
        if(added > 0) {
            setStatus("Some tasks were added")
        } else {
            setStatus("No tasks needed being added")
        }
    }
}

const manager = new TaskManager()
const IMPORT_BUTTON = document.getElementById('importButton')
const EXPORT_BUTTON = document.getElementById('exportButton')
const GET_TASK_BUTTON = document.getElementById('getTaskButton')
const DONE_TASK_BUTTON = document.getElementById('doneTaskButton')
const TASK_FORM = document.getElementById('taskForm')
const NEW_TITLE_FIELD = document.getElementById('newTitle')
const OLD_TITLE_FIELD = document.getElementById('oldTitle')
const NEW_COMMENTS_FIELD = document.getElementById('newComments')
const OLD_COMMENTS_FIELD = document.getElementById('oldComments')
const STATUS_FIELD = document.getElementById('status')
const STORAGE_KEY = 'tasks'
setupUI()
manager.restoreTasks()
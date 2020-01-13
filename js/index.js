window.onload = function() {
	const STORAGE_KEY = 'todos-vuejs-2.0'

	var todoStorage = {
		uid:0,
		fetch() {
			let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
			todos.forEach((todo, index) => {
				todo.id = index
			})
			this.uid = todos.length
			return todos
		},
		save(todos) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
		}
	}

//定义过滤器,可以分别对active,completed,all进行过滤
	var filters = {
		all(todos) {
			return todos
		},
		active(todos) {
			return todos.filter(todo => {
				return !todo.completed
			})
		},
		completed(todos) {
			return todos.filter(todo => {
				return todo.completed
			})
		}
	}

	var app = new Vue({
		data: {
			todos: todoStorage.fetch(),
			newTodo: '',
			editedTodo: null,
			visibility: 'all'
		},
		watch: {
			todos: {
				handler(todos) {
					todoStorage.save(todos)
				},
				deep: true
			}
		},
		//定义computed properties,可以认为是用来过滤的
		computed: {
			filteredTodos() {
				return filters[this.visibility](this.todos)
			},
			remaining() {
				return filters.active(this.todos).length
			},
			allDone: {
				get:function() {
					return this.remaining === 0
				},
				set:function(value) {
					this.todos.forEach(todo => {
						todo.completed = value
					})
				}
			}
		},
		//定义过滤器
		filters: {
			pluralize(n) {
				return n === 1 ? 'item' : 'items'
			}
		},
		//核心方法,实现对于待办事项的增加,删除和修改
		methods: {
			addTodo() {
				let value = this.newTodo && this.newTodo.trim()
				if (!value) {
					return
				}
				this.todos.push({
					id: todoStorage.uid++,
					title: value,
					completed: false
				})
				this.newTodo = ''
			},
			removeTodo(todo) {
				this.todos.splice(this.todos.indexOf(todo), 1)
			},
			//编辑待办事项
			editTodo(todo) {
				this.beforeEditCache = todo.title
				this.editTodo = todo
			},
			//把待办事项标为已完成
			doneEdit(todo) {
				if (!this.editTodo) {
					return
				}
				this.editTodo = null
				todo.title = todo.title.trim()
				if (!todo.title) {
					this.removeTodo(todo)
				}
			},
			//取消编辑
			cancelEdit(todo) {
				this.editTodo = null
				todo.title = this.beforeEditCache
			},
			//删除已完成的待办事项
			removeCompleted() {
				this.todos = filters.active(this.todos)
			}
		},
		//自定义Directive,也就是<todo-focus>
		directives: {
			'todo-focus': function(el, binding) {
				if (binding.value) {
					el.focus()
				}
			}
		}
	})
	
	//处理路由
	function onHashChange() {
		let visibility = window.location.hash.replace(/#\/?/, '')
		if (filters[visibility]) {
			app.visibility = visibility
		} else {
			window.location.hash = ''
			app.visibility = 'all'
		}
	}

	window.addEventListener('hashchange', onHashChange)
	onHashChange()
	app.$mount('.todoapp')
}

import Vue from 'vue'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

if (!isIE9) {
  describe('Transition system', () => {
    const duration = 20
    insertCSS(`
      .test {
        -webkit-transition: opacity ${duration}ms ease;
        transition: opacity ${duration}ms ease;
      }
      .v-enter, .v-leave-active,
      .test-enter, .test-leave-active,
      .hello, .bye.active,
      .changed-enter {
        opacity: 0;
      }
      .test-anim-enter-active {
        animation: test-enter ${duration}ms;
        -webkit-animation: test-enter ${duration}ms;
      }
      .test-anim-leave-active {
        animation: test-leave ${duration}ms;
        -webkit-animation: test-leave ${duration}ms;
      }
      @keyframes test-enter {
        from { opacity: 0 }
        to { opacity: 1 }
      }
      @-webkit-keyframes test-enter {
        from { opacity: 0 }
        to { opacity: 1 }
      }
      @keyframes test-leave {
        from { opacity: 1 }
        to { opacity: 0 }
      }
      @-webkit-keyframes test-leave {
        from { opacity: 1 }
        to { opacity: 0 }
      }
    `)

    let el
    beforeEach(() => {
      el = document.createElement('div')
      document.body.appendChild(el)
    })

    it('basic transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition>foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test v-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('named transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('custom transition classes', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            enterClass: 'hello',
            enterActiveClass: 'hello-active',
            leaveClass: 'bye',
            leaveActiveClass: 'bye active' // testing multi classes
          }
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test bye active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('dynamic transition', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" :transition="trans">foo</div></div>',
        data: {
          ok: true,
          trans: 'test'
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
        vm.trans = 'changed'
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test changed-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('inline transition object', done => {
      const vm = new Vue({
        template: `<div><div v-if="ok" class="test" :transition="{
          enterClass: 'hello',
          enterActiveClass: 'hello-active',
          leaveClass: 'bye',
          leaveActiveClass: 'bye active'
        }">foo</div></div>`,
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test bye')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test bye active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test hello-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition with JavaScript hooks', done => {
      const beforeLeaveSpy = jasmine.createSpy('beforeLeave')
      const beforeEnterSpy = jasmine.createSpy('beforeEnter')
      const hooks = {
        beforeLeave: el => {
          expect(el).toBe(vm.$el.children[0])
          expect(el.className).toBe('test')
          beforeLeaveSpy()
        },
        leave: jasmine.createSpy('leave'),
        afterLeave: jasmine.createSpy('afterLeave'),
        beforeEnter: el => {
          expect(vm.$el.contains(el)).toBe(false)
          expect(el.className).toBe('test')
          beforeEnterSpy()
        },
        enter: jasmine.createSpy('enter'),
        afterEnter: jasmine.createSpy('afterEnter')
      }

      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: hooks
        }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(beforeLeaveSpy).toHaveBeenCalled()
        expect(hooks.leave).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(hooks.afterLeave).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(hooks.afterLeave).toHaveBeenCalled()
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(beforeEnterSpy).toHaveBeenCalled()
        expect(hooks.enter).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(hooks.afterEnter).not.toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(hooks.afterEnter).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('explicit user callback in JavaScript hooks', done => {
      let next
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            enter: (el, cb) => {
              next = cb
            },
            leave: (el, cb) => {
              next = cb
            }
          }
        }
      }).$mount(el)
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children.length).toBe(0)
      }).then(() => {
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
        expect(next).toBeTruthy()
        next()
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('css: false', done => {
      const enterSpy = jasmine.createSpy('enter')
      const leaveSpy = jasmine.createSpy('leave')
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            css: false,
            enter: enterSpy,
            leave: leaveSpy
          }
        }
      }).$mount(el)

      vm.ok = false
      waitForUpdate(() => {
        expect(leaveSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('')
        vm.ok = true
      }).then(() => {
        expect(enterSpy).toHaveBeenCalled()
        expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      }).then(done)
    })

    it('enterCancelled', done => {
      const spy = jasmine.createSpy('enterCancelled')
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test">foo</div></div>',
        data: { ok: false },
        transitions: {
          test: {
            enterCancelled: spy
          }
        }
      }).$mount(el)

      expect(vm.$el.innerHTML).toBe('')
      vm.ok = true
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(timeout(duration / 2)).then(() => {
        vm.ok = false
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
      }).then(done)
    })

    it('transition with v-show', done => {
      const vm = new Vue({
        template: '<div><div v-show="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.textContent).toBe('foo')
      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].style.display).toBe('none')
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('leaveCancelled (v-show only)', done => {
      const spy = jasmine.createSpy('leaveCancelled')
      const vm = new Vue({
        template: '<div><div v-show="ok" class="test" transition="test">foo</div></div>',
        data: { ok: true },
        transitions: {
          test: {
            leaveCancelled: spy
          }
        }
      }).$mount(el)

      expect(vm.$el.children[0].style.display).toBe('')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-leave-active')
      }).thenWaitFor(timeout(duration / 2)).then(() => {
        vm.ok = true
      }).then(() => {
        expect(spy).toHaveBeenCalled()
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].style.display).toBe('')
      }).then(done)
    })

    it('animations', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test-anim">foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.innerHTML).toBe('<div class="test">foo</div>')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-anim-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on appear', done => {
      const vm = new Vue({
        template: '<div><div v-if="ok" class="test" transition="test" transition-on-appear>foo</div></div>',
        data: { ok: true }
      }).$mount(el)

      waitForUpdate(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.children[0].className).toBe('test test-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.children[0].className).toBe('test')
      }).then(done)
    })

    it('transition on SVG elements', done => {
      const vm = new Vue({
        template: '<svg><circle cx="0" cy="0" r="10" v-if="ok" class="test" transition></circle></svg>',
        data: { ok: true }
      }).$mount(el)

      // should not apply transition on initial render by default
      expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      vm.ok = false
      waitForUpdate(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-leave-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.childNodes.length).toBe(0)
        vm.ok = true
      }).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter')
      }).thenWaitFor(nextFrame).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test v-enter-active')
      }).thenWaitFor(timeout(duration + 10)).then(() => {
        expect(vm.$el.childNodes[0].getAttribute('class')).toBe('test')
      }).then(done)
    })
  })
}

function insertCSS (text) {
  var cssEl = document.createElement('style')
  cssEl.textContent = text.trim()
  document.head.appendChild(cssEl)
}

function timeout (n) {
  return next => setTimeout(next, n)
}

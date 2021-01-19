function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) =>
                typeof child === 'object' ? child : createElement(child)
            ),
        },
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    }
}

function createDom(fiber) {
    const dom =
        fiber.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(fiber.type)
    const isProperty = (key) => key !== 'children'

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((name) => {
            dom[name] = fiber.props[name]
        })
    return dom
}

function updateDom(dom, prevProps, nextProps) {
    //TODO
}

function commitRoot() {
    // TODO add dom node
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    } else if (fiber.effectTag === 'DELETION') {
        domParent.removeChild(fiber.dom)
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function render(element, container) {
    ;(wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    }),
        (deletions = []),
        (nextUnitOfWork = wipRoot)
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
    let shouldYield = false
    while (!shouldYield && nextUnitOfWork) {
        nextUnitOfWork = performUnitWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitWork(fiber) {
    // TODO add dom node

    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }
    // TODO create new fiber

    const elements = fiber.props.children

    reconcileChildren(fiber, elements)

    // TODO return next unit of work
    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function reconcileChildren(wipFiber, elements) {
    // TODO add dom node
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while (index < elements.length || oldFiber != null) {
        const element = elements[index]
        let newFiber = null
        // TODO compare oldFiber to element

        const sameType = oldFiber && element && element.type === oldFiber.type

        if (sameType) {
            // TODO update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE',
            }
        }

        if (element && !sameType) {
            // TODO add the node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT',
            }
        }

        if (oldFiber && !sameType) {
            // TODO delete the OldFiber's node
            oldFiber.effectTag = 'DELETION'
            deletions.push(oldFiber)
        }

        if (index === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

const Didact = {
    createElement,
    render,
}

const c1 = Didact.createElement('h1', { textContent: 'h1' })
const c2 = Didact.createElement('h2', { textContent: 'h2' })
const element = Didact.createElement('div', { textContent: '....' }, c1, c2)
const container = document.getElementById('root')
Didact.render(element, container)

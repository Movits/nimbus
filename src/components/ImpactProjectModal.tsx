import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ImpactProject } from '../data/content'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type ImpactProjectModalProps = {
  project: ImpactProject
  onClose: () => void
}

export default function ImpactProjectModal({ project, onClose }: ImpactProjectModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = document.getElementById('root')
    const rootWasInert = root?.hasAttribute('inert') ?? false
    const rootAriaHidden = root?.getAttribute('aria-hidden')
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const bodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    }
    const htmlScrollBehavior = document.documentElement.style.scrollBehavior

    root?.setAttribute('inert', '')
    root?.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')

      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', onKeyDown)

      if (root) {
        if (!rootWasInert) root.removeAttribute('inert')
        if (rootAriaHidden == null) root.removeAttribute('aria-hidden')
        else root.setAttribute('aria-hidden', rootAriaHidden)
      }

      Object.assign(document.body.style, bodyStyles)
      document.documentElement.style.scrollBehavior = 'auto'
      window.scrollTo(0, scrollY)
      document.documentElement.style.scrollBehavior = htmlScrollBehavior
      previousFocus?.focus({ preventScroll: true })
    }
  }, [onClose])

  return createPortal(
    <div
      className="project-modal__backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`project-modal-title-${project.id}`}
        aria-describedby={`project-modal-desc-${project.id}`}
        tabIndex={-1}
      >
        <button
          ref={closeRef}
          className="project-modal__close"
          type="button"
          aria-label={`Fechar informações sobre ${project.name}`}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="project-modal__scroll">
          <div className="project-modal__media">
            <img
              src={project.image}
              alt={project.imageAlt}
              width="1200"
              height="800"
              decoding="async"
            />
          </div>

          <div className="project-modal__content">
            <p className="kicker">Projeto social</p>
            <h2 id={`project-modal-title-${project.id}`} className="project-modal__title">
              {project.name}
            </h2>
            <p id={`project-modal-desc-${project.id}`} className="project-modal__intro">
              {project.desc}
            </p>

            <dl className="project-modal__facts">
              <div>
                <dt>Área de atuação</dt>
                <dd>{project.area}</dd>
              </div>
              <div>
                <dt>Alcance</dt>
                <dd>{project.scope}</dd>
              </div>
              <div>
                <dt>Como atua</dt>
                <dd>{project.method}</dd>
              </div>
            </dl>

            {project.website && (
              <a className="btn btn--primary project-modal__link" href={project.website} target="_blank" rel="noreferrer">
                Visitar site oficial
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M8 5h11v11M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

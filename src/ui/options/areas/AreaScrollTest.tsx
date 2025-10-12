import S from "./AreaScrollTest.module.scss"
import L from "../layout.module.scss"

export default function AreaScrollTest() {
  return (
    <section class={`${L.section} ${S.area}`}>
      <label class={L.label}>test your scroll</label>
      <div class={S.body} data-cy="test-context">
        <div class={S.articleContainer}>
          {Array.from({ length: 30 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <TestArticle
                key={`${row}_${col}`}
                title={`${row + 1}, ${col + 1}`}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function TestArticle({ title }: { title: string }) {
  return (
    <article class={S.article}>
      <h2>Article ({title})</h2>
      {Array.from({ length: 3 }).map((_, idx) => (
        <p key={idx}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci,
          cumque? Ea facilis velit accusantium error sapiente doloribus iure qui
          suscipit sunt, itaque non veniam ex harum assumenda praesentium
          magnam. Perferendis?
        </p>
      ))}
    </article>
  )
}

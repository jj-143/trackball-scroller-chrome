export default function AreaScrollTest() {
  return (
    <div id="test-area">
      <label class="control">test your scroll</label>
      <div id="test-context">
        <div id="test-article-container">
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
    </div>
  )
}

function TestArticle({ title }: { title: string }) {
  return (
    <article class="test-article">
      <h2>Article ({title})</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci,
        cumque? Ea facilis velit accusantium error sapiente doloribus iure qui
        suscipit sunt, itaque non veniam ex harum assumenda praesentium magnam.
        Perferendis?
      </p>
    </article>
  )
}

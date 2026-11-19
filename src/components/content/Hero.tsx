export function Hero({
  title,
  lede,
  small = false,
}: {
  title: string;
  lede: string;
  small?: boolean;
}) {
  return (
    <div className="hero">
      <h1 className={small ? "sm" : undefined}>{title}</h1>
      <p className="lede">{lede}</p>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import MediaCardLink from "../MediaCardLink.jsx";

function DiscoverRow({ title, subtitle, browseUrl, media }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = trackRef.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [updateScrollState, media]);

  const scrollByPage = (direction) => {
    const node = trackRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!media || media.length === 0) return null;

  return (
    <section className="discover-row">
      <header className="discover-row__header">
        <Link className="discover-row__title" to={browseUrl}>
          <h2>{title}</h2>
          {subtitle && <span className="discover-row__subtitle">{subtitle}</span>}
        </Link>
        <Link className="discover-row__view-all" to={browseUrl}>
          View all
          <MdChevronRight size={20} aria-hidden="true" />
        </Link>
      </header>

      <div
        className={`discover-row__viewport${canScrollLeft ? " can-scroll-left" : ""}${
          canScrollRight ? " can-scroll-right" : ""
        }`}
      >
        <button
          type="button"
          className="discover-row__arrow discover-row__arrow--left"
          onClick={() => scrollByPage(-1)}
          aria-label={`Scroll ${title} left`}
          tabIndex={canScrollLeft ? 0 : -1}
          disabled={!canScrollLeft}
        >
          <MdChevronLeft size={28} />
        </button>

        <div className="discover-row__track" ref={trackRef} onScroll={updateScrollState}>
          {media.map((content) => (
            <div className="discover-row__item" key={content.id}>
              <MediaCardLink content={content} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="discover-row__arrow discover-row__arrow--right"
          onClick={() => scrollByPage(1)}
          aria-label={`Scroll ${title} right`}
          tabIndex={canScrollRight ? 0 : -1}
          disabled={!canScrollRight}
        >
          <MdChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}

export default DiscoverRow;

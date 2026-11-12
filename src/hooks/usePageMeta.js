import { useEffect } from "react";

export default function usePageMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    const created = !tag;
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    const previousDescription = tag.content;
    if (description) tag.content = description;
    return () => {
      document.title = previousTitle;
      if (created) tag.remove();
      else tag.content = previousDescription;
    };
  }, [title, description]);
}

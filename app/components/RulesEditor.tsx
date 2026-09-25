"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RulesEditorProps = {
	value: string;
	onChange: (value: string) => void;
};

export default function RulesEditor({
	value,
	onChange,
}: RulesEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [2, 3],
				},
			}),
		],
		content: value,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	if (!editor) {
		return null;
	}

	const toolbarButton = (active = false) =>
		`rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
			active
				? "bg-[var(--accent)] text-[var(--background)]"
				: "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
		}`;

	return (
		<div className="overflow-hidden rounded-md border border-[var(--surface-alt)]">
			<div className="flex flex-wrap gap-1 border-b border-[var(--surface-alt)] bg-[var(--background)] p-2">
				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleBold()
							.run()
					}
					className={toolbarButton(
						editor.isActive("bold")
					)}
				>
					B
				</button>

				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleItalic()
							.run()
					}
					className={`${toolbarButton(
						editor.isActive("italic")
					)} italic`}
				>
					I
				</button>

				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleHeading({
								level: 2,
							})
							.run()
					}
					className={toolbarButton(
						editor.isActive("heading", {
							level: 2,
						})
					)}
				>
					H2
				</button>

				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleHeading({
								level: 3,
							})
							.run()
					}
					className={toolbarButton(
						editor.isActive("heading", {
							level: 3,
						})
					)}
				>
					H3
				</button>

				<div className="mx-1 w-px bg-[var(--surface-alt)]" />

				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleBulletList()
							.run()
					}
					className={toolbarButton(
						editor.isActive("bulletList")
					)}
				>
					• List
				</button>

				<button
					type="button"
					onClick={() =>
						editor
							.chain()
							.focus()
							.toggleOrderedList()
							.run()
					}
					className={toolbarButton(
						editor.isActive("orderedList")
					)}
				>
					1. List
				</button>
			</div>

			<EditorContent
				editor={editor}
				className="
					min-h-[50vh]
					bg-[var(--background)]
					px-5
					py-4
					text-[var(--text)]
					[&_.tiptap]:min-h-[50vh]
					[&_.tiptap]:outline-none
					[&_.tiptap_h2]:mb-3
					[&_.tiptap_h2]:mt-6
					[&_.tiptap_h2]:font-[family-name:var(--font-serif)]
					[&_.tiptap_h2]:text-2xl
					[&_.tiptap_h3]:mb-2
					[&_.tiptap_h3]:mt-5
					[&_.tiptap_h3]:font-[family-name:var(--font-serif)]
					[&_.tiptap_h3]:text-xl
					[&_.tiptap_p]:my-3
					[&_.tiptap_ul]:my-3
					[&_.tiptap_ul]:list-disc
					[&_.tiptap_ul]:pl-6
					[&_.tiptap_ol]:my-3
					[&_.tiptap_ol]:list-decimal
					[&_.tiptap_ol]:pl-6
					[&_.tiptap_li]:my-1
				"
			/>
		</div>
	);
}
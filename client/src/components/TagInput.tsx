import React, { useState } from 'react';

const SUGGESTED_TAGS = [
    'rock music',
    'cricket',
    'coding',
    'travel',
    'food',
    'vlog',
    'tutorial',
];

interface TagInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

function TagInput({ tags, setTags }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
        e.preventDefault();
        addTag(input.trim());
        }
    };

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
        setTags([...tags, tag]);
        }
        setInput('');
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // Filter out already selected tags from suggestions
    const filteredSuggestions = SUGGESTED_TAGS.filter(
        (tag) => !tags.includes(tag)
    );

    return (
        <div>
        <div className="mb-2 d-flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
            <span key={idx} className="badge bg-primary">
                {tag}
                <button
                type="button"
                className="btn-close btn-close-white btn-sm ms-2"
                aria-label="Remove"
                style={{ fontSize: '0.7em' }}
                onClick={() => removeTag(idx)}
                />
            </span>
            ))}
        </div>
        <input
            type="text"
            className="form-control mb-2"
            placeholder="Add tags e.g 'rock music', 'cricket' etc"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
        />
        {filteredSuggestions.length > 0 && (
            <div className="mb-2">
            <small className="text-secondary">Suggested:</small>
            <div className="d-flex flex-wrap gap-2 mt-1">
                {filteredSuggestions.map((tag) => (
                <button
                    key={tag}
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => addTag(tag)}
                >
                    {tag}
                </button>
                ))}
            </div>
            </div>
        )}
        </div>
    );
}

export default TagInput;
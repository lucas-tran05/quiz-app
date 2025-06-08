import { h } from 'preact';

export default function QuestionCard({
    index,
    question,
    answer,
    reviewMark,
    onToggleReview,
    onAnswerChange,
    isCorrect = false,
    locked = false,
    canMarkReview = true,
}) {
    return (
        <div id={`question-${index}`} className="mb-4 question">
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
                {canMarkReview && (
                    <input
                        type="checkbox"
                        id={`review-${index}`}
                        className="form-check-input"
                        checked={reviewMark || false}
                        onChange={() => onToggleReview(index)}
                    />
                )}
                <h6 style={{ fontWeight: 'bold', textAlign: 'justify', margin: 0 }}>
                    {index + 1}. {question.question}
                </h6>
            </div>
            {!!question.image && (
                <div style={{ display: 'flex', marginBottom: '8px', textAlign: 'justify', width: '100%', justifyContent: 'center' }}>
                    <img
                        draggable="false"
                        loading="lazy"
                        src={question.image}
                        alt={`Question ${index + 1}`}
                        className="question-image"
                    />
                </div>
            )}


            {['a', 'b', 'c', 'd'].map((key) => {
                const isAnswerCorrect = question.correctAnswer === key;
                const isUserChoice = answer === key;

                return (
                    <div
                        class={`form-check ${locked && isAnswerCorrect ? 'border border-success rounded px-2 py-1' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: locked && isAnswerCorrect ? '#e6ffed' : 'transparent',
                        }}
                        key={key}
                    >
                        <input
                            type="radio"
                            id={`${key}-${index}`}
                            name={`answer-${index}`}
                            class="form-check-input"
                            onChange={() => onAnswerChange(index, key)}
                            checked={isUserChoice}
                            disabled={locked}
                        />
                        <label htmlFor={`${key}-${index}`} class="form-check-label" style={{ textAlign: 'justify' }}>
                            {question[key]}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

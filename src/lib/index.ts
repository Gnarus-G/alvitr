/**
 *Explains the context to gpt for more appropriate text completions.
 */
const PRELUDE =
	'The following is a conversation between you and an AI assistant named Al. Al is helpful, creative, clever, and very friendly.';

/**
 * Format an array of strings into a classic dialogue between two people.
 */
export function formatPrompt(lines: string[]) {
	const prompt = chunkTwos(lines)
		.map(([you, al]) => {
			if (al) {
				return `You: ${you}\n\nAl: ${al}`;
			}
			return `You: ${you}\n\nAl:`;
		})
		.join('\n\n');

	return `${PRELUDE}\n\n${prompt}`;
}

export function toDialogueStructs(lines: string[]) {
	return chunkTwos(lines).map(([you, al]) => ({ you, al }));
}

type TwoAtMost<T> = [T] | [T, T];

function chunkTwos<T>(array: T[]) {
	const result: TwoAtMost<T>[] = [];
	for (let i = 0; i < array.length; i += 2) {
		const chunk = array.slice(i, i + 2) as TwoAtMost<T>;
		result.push(chunk);
	}
	return result;
}

import { VotingPage } from '../components/VotingPage';

interface WouldYouRatherQuestion {
  id: string;
  optionA: string;
  optionB: string;
}

const WOULD_YOU_RATHER_QUESTIONS: WouldYouRatherQuestion[] = [
  { id: 'q1', optionA: 'Have a pet dragon', optionB: 'Have a pet unicorn' },
  { id: 'q2', optionA: 'Read minds', optionB: 'See the future' },
  { id: 'q3', optionA: 'Read instantly', optionB: 'Write automatically' },
  { id: 'q4', optionA: 'Best player on a losing team', optionB: 'Worst player on a winning team' },
  { id: 'q5', optionA: 'Rich person 100 years in the past', optionB: 'Poor person 100 years in the future' },
  { id: 'q6', optionA: 'Same song stuck in your head', optionB: 'Same dream every night' }
];

export default function SubjectsPage() {
  return (
    <VotingPage
      title="🤔 Would You Rather? 🤷"
      description="Answer each question by choosing your favorite option!"
      questions={WOULD_YOU_RATHER_QUESTIONS}
    />
  );
}
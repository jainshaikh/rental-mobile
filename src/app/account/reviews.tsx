import { EligibleReviewsList } from '../../features/reviews/components/EligibleReviewsList';
import { AppScreen } from '../../components/ui';

export default function ReviewsScreen() {
  return (
    <AppScreen scroll edges={['left', 'right', 'bottom']}>
      <EligibleReviewsList />
    </AppScreen>
  );
}

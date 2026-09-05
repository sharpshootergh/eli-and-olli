import WelcomeSection from '@/components/sections/WelcomeSection';
import StorySection from '@/components/sections/StorySection';
import RsvpSection from '@/components/sections/RsvpSection';
import RegistrySection from '@/components/sections/RegistrySection';
import MomentsSection from '@/components/sections/MomentsSection';

export default function Home() {
  return (
    <div>
      <WelcomeSection />
      <StorySection />
      <RsvpSection />
      <RegistrySection />
      <MomentsSection />
    </div>
  );
}

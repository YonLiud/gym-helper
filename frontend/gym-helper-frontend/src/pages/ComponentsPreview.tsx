import { useState } from 'react'
import {
  Alert,
  AuthFooter,
  Badge,
  Button,
  Card,
  EmptyState,
  FooterLinks,
  Input,
  MuscleGroupBar,
  PageHeader,
  RecentPRs,
  Select,
  Spinner,
  StatCard,
  Textarea,
} from '../components'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 style={{ margin: '0 0 16px' }}>{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

export function ComponentsPreviewPage() {
  const [inputVal, setInputVal] = useState('')
  const [textareaVal, setTextareaVal] = useState('')
  const [selectVal, setSelectVal] = useState('')

  return (
    <div className="p-8 text-left max-w-3xl mx-auto">
      <PageHeader
        title="Component Preview"
        description="All UI components in one place."
      />

      <Section title="Button">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      <Section title="Input">
        <Input
          label="Username"
          placeholder="Enter username"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
        />
        <Input label="With error" placeholder="Bad value" error="This field is required." />
        <Input placeholder="No label" />
      </Section>

      <Section title="Textarea">
        <Textarea
          label="Notes"
          placeholder="Add any notes…"
          value={textareaVal}
          onChange={e => setTextareaVal(e.target.value)}
        />
        <Textarea label="With error" error="Notes are too long." />
      </Section>

      <Section title="Select">
        <Select
          label="Muscle group"
          placeholder="Select one…"
          value={selectVal}
          onChange={e => setSelectVal(e.target.value)}
          options={[
            { value: 'chest', label: 'Chest' },
            { value: 'back', label: 'Back' },
            { value: 'legs', label: 'Legs' },
            { value: 'shoulders', label: 'Shoulders' },
          ]}
        />
        <Select
          label="With error"
          placeholder="Select one…"
          options={[{ value: 'a', label: 'Option A' }]}
          error="Please select an option."
        />
      </Section>

      <Section title="Card">
        <Card>
          <p className="text-(--text-h) font-medium">Basic card</p>
          <p className="text-sm text-(--text)">Plain container with border.</p>
        </Card>
        <Card onClick={() => alert('clicked!')}>
          <p className="text-(--text-h) font-medium">Clickable card</p>
          <p className="text-sm text-(--text)">Hover to see accent border.</p>
        </Card>
      </Section>

      <Section title="Badge">
        <Row>
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </Row>
      </Section>

      <Section title="Spinner">
        <Row>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Section>

      <Section title="Alert">
        <Alert variant="error">Something went wrong. Please try again.</Alert>
        <Alert variant="success">Workout saved successfully.</Alert>
        <Alert variant="warning">Your session is about to expire.</Alert>
        <Alert variant="info">Tip: add notes to track your progress over time.</Alert>
      </Section>

      <Section title="EmptyState">
        <Card>
          <EmptyState
            title="No workouts yet"
            description="Start logging your sessions to track progress over time."
            action={<Button size="sm">Add workout</Button>}
          />
        </Card>
      </Section>

      <Section title="StatCard">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="This week" value={4} sub="workouts" />
          <StatCard label="Streak" value={3} sub="weeks" />
          <StatCard label="Volume" value="12.4k" sub="kg this week" />
          <StatCard label="Last session" value="1" sub="day ago" />
        </div>
      </Section>

      <Section title="MuscleGroupBar">
        <MuscleGroupBar groups={[
          { name: 'Chest', count: 42, daysSinceLastTrained: 2 },
          { name: 'Back', count: 38, daysSinceLastTrained: 4 },
          { name: 'Legs', count: 31, daysSinceLastTrained: 10 },
          { name: 'Shoulders', count: 19, daysSinceLastTrained: 18 },
          { name: 'Arms', count: 14, daysSinceLastTrained: 8 },
        ]} />
      </Section>

      <Section title="RecentPRs">
        <RecentPRs prs={[
          { exerciseId: '1', exerciseName: 'Bench Press', muscleGroup: 'Chest', weight: 100, reps: 5 },
          { exerciseId: '2', exerciseName: 'Squat', muscleGroup: 'Legs', weight: 140, reps: 3 },
          { exerciseId: '3', exerciseName: 'Deadlift', muscleGroup: 'Back', weight: 180, reps: 1 },
          { exerciseId: '4', exerciseName: 'Overhead Press', muscleGroup: 'Shoulders', weight: 70, reps: 5 },
        ]} />
      </Section>

      <Section title="FooterLinks">
        <FooterLinks />
      </Section>

      <Section title="AuthFooter">
        <AuthFooter links={[{ label: '← Home', to: '/' }, { label: 'Register', to: '/register' }]} />
        <AuthFooter links={[{ label: '← Home', to: '/' }, { label: 'Sign in instead', to: '/login' }]} />
      </Section>
    </div>
  )
}

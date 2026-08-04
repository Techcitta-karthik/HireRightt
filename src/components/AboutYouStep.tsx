import type { ProfileFormData } from '../data/wizard'
import {
  EXPERIENCE_OPTIONS,
  LOCATION_OPTIONS,
  NOTICE_OPTIONS,
  ROLE_OPTIONS,
} from '../data/wizard'
import { CharacterTextarea } from './CharacterTextarea'
import { ResumeUpload } from './ResumeUpload'
import { SelectField } from './SelectField'
import styles from './StepPanels.module.css'

interface AboutYouStepProps {
  data: ProfileFormData
  uploadedResumeName?: string
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
}

export function AboutYouStep({
  data,
  onChange,
  uploadedResumeName,
}: AboutYouStepProps) {
  return (
    <div className={styles.stack}>
      <ResumeUpload
        file={data.resumeFile}
        uploadedName={uploadedResumeName}
        onFileChange={(file) => onChange('resumeFile', file)}
      />

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>2. Tell Us About Yourself</h3>
          <p>Help us know you better in a few words.</p>
        </div>

        <div className={styles.twoCol}>
          <CharacterTextarea
            label="Who are you?"
            value={data.whoAreYou}
            maxLength={300}
            placeholder="A short intro — your role, background, and what makes you unique..."
            onChange={(value) => onChange('whoAreYou', value)}
          />
          <CharacterTextarea
            label="What drives you?"
            value={data.whatDrivesYou}
            maxLength={300}
            placeholder="Share the motivations, goals, or passions that fuel your work..."
            onChange={(value) => onChange('whatDrivesYou', value)}
          />
        </div>

        <CharacterTextarea
          label="What are your key strengths?"
          value={data.keyStrengths}
          maxLength={250}
          placeholder="Highlight the skills and qualities you're most known for..."
          onChange={(value) => onChange('keyStrengths', value)}
          rows={3}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>3. Your Current Snapshot</h3>
        </div>
        <div className={styles.fourCol}>
          <SelectField
            label="Current Role"
            value={data.currentRole}
            options={ROLE_OPTIONS}
            placeholder="Select role"
            onChange={(value) => onChange('currentRole', value)}
          />
          <SelectField
            label="Total Experience"
            value={data.totalExperience}
            options={EXPERIENCE_OPTIONS}
            placeholder="Select experience"
            onChange={(value) => onChange('totalExperience', value)}
          />
          <SelectField
            label="Current Location"
            value={data.currentLocation}
            options={LOCATION_OPTIONS}
            placeholder="Select location"
            onChange={(value) => onChange('currentLocation', value)}
          />
          <SelectField
            label="Notice Period"
            value={data.noticePeriod}
            options={NOTICE_OPTIONS}
            placeholder="Select notice"
            onChange={(value) => onChange('noticePeriod', value)}
          />
        </div>
      </section>
    </div>
  )
}

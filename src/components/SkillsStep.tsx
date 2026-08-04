import { useState, type KeyboardEvent } from 'react'
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  SUGGESTED_SKILLS,
  createEmptyExperience,
  type ProfileFormData,
  type WorkExperience,
} from '../data/wizard'
import { SelectField } from './SelectField'
import styles from './SkillsStep.module.css'

interface SkillsStepProps {
  data: ProfileFormData
  onChange: <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => void
}

function monthLabel(value: string) {
  if (!value) return ''
  const [year, month] = value.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [skillDraft, setSkillDraft] = useState('')

  function addSkill(raw: string) {
    const skill = raw.trim()
    if (!skill) return
    if (data.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkillDraft('')
      return
    }
    onChange('skills', [...data.skills, skill])
    setSkillDraft('')
  }

  function removeSkill(skill: string) {
    onChange(
      'skills',
      data.skills.filter((item) => item !== skill),
    )
  }

  function onSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSkill(skillDraft)
    }
  }

  function updateExperience(
    id: string,
    patch: Partial<WorkExperience>,
  ) {
    onChange(
      'workExperiences',
      data.workExperiences.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    )
  }

  function addExperience() {
    onChange('workExperiences', [
      ...data.workExperiences,
      createEmptyExperience(),
    ])
  }

  function removeExperience(id: string) {
    if (data.workExperiences.length <= 1) {
      onChange('workExperiences', [
        { ...createEmptyExperience(), id: data.workExperiences[0]?.id ?? crypto.randomUUID() },
      ])
      return
    }
    onChange(
      'workExperiences',
      data.workExperiences.filter((item) => item.id !== id),
    )
  }

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (skill) =>
      !data.skills.some((item) => item.toLowerCase() === skill.toLowerCase()),
  )

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>1. Add Your Skills</h3>
          <p>Add skills relevant to the roles you&apos;re interested in.</p>
        </div>

        <label className={styles.fieldLabel} htmlFor="skill-input">
          Your Skills
        </label>
        <input
          id="skill-input"
          className={styles.textInput}
          type="text"
          value={skillDraft}
          placeholder="Type a skill and press Enter"
          onChange={(event) => setSkillDraft(event.target.value)}
          onKeyDown={onSkillKeyDown}
        />

        {data.skills.length > 0 && (
          <div className={styles.tagList}>
            {data.skills.map((skill) => (
              <span key={skill} className={styles.skillTag}>
                {skill}
                <button
                  type="button"
                  className={styles.tagRemove}
                  aria-label={`Remove ${skill}`}
                  onClick={() => removeSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {availableSuggestions.length > 0 && (
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>Suggested</p>
            <div className={styles.suggestRow}>
              {availableSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={styles.suggestChip}
                  onClick={() => addSkill(skill)}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>2. Work Experience</h3>
          <p>Add your work experience details.</p>
        </div>

        <div className={styles.experienceList}>
          {data.workExperiences.map((exp, index) => (
            <article key={exp.id} className={styles.experienceCard}>
              <div className={styles.expIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <rect
                    x="3.5"
                    y="7"
                    width="17"
                    height="12.5"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M3.5 12H20.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>

              <div className={styles.expBody}>
                <div className={styles.expTop}>
                  <p className={styles.expIndex}>Experience {index + 1}</p>
                  {data.workExperiences.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeExp}
                      onClick={() => removeExperience(exp.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label>
                      Job Title <span className={styles.req}>*</span>
                    </label>
                    <input
                      className={styles.textInput}
                      value={exp.jobTitle}
                      placeholder="e.g. Software Engineer"
                      onChange={(event) =>
                        updateExperience(exp.id, {
                          jobTitle: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label>
                      Company <span className={styles.req}>*</span>
                    </label>
                    <input
                      className={styles.textInput}
                      value={exp.company}
                      placeholder="e.g. TechCitta Solutions Pvt. Ltd."
                      onChange={(event) =>
                        updateExperience(exp.id, {
                          company: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.threeCol}>
                  <SelectField
                    label="Employment Type"
                    value={exp.employmentType}
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    placeholder="Select type"
                    onChange={(value) =>
                      updateExperience(exp.id, { employmentType: value })
                    }
                  />
                  <div className={styles.field}>
                    <label>
                      Start Date <span className={styles.req}>*</span>
                    </label>
                    <div className={styles.dateWrap}>
                      <input
                        className={styles.textInput}
                        type="month"
                        value={exp.startDate}
                        onChange={(event) =>
                          updateExperience(exp.id, {
                            startDate: event.target.value,
                          })
                        }
                      />
                      {exp.startDate && (
                        <span className={styles.dateHint}>
                          {monthLabel(exp.startDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>End Date</label>
                    {exp.currentlyWorking ? (
                      <input
                        className={styles.textInput}
                        value="Present"
                        readOnly
                      />
                    ) : (
                      <input
                        className={styles.textInput}
                        type="month"
                        value={exp.endDate}
                        onChange={(event) =>
                          updateExperience(exp.id, {
                            endDate: event.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </div>

                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={exp.currentlyWorking}
                    onChange={(event) =>
                      updateExperience(exp.id, {
                        currentlyWorking: event.target.checked,
                        endDate: event.target.checked ? '' : exp.endDate,
                      })
                    }
                  />
                  <span className={styles.checkboxUi} aria-hidden="true" />
                  I currently work here
                </label>

                <div className={styles.field}>
                  <label>Location</label>
                  <input
                    className={styles.textInput}
                    value={exp.location}
                    placeholder="e.g. Hyderabad, India"
                    onChange={(event) =>
                      updateExperience(exp.id, {
                        location: event.target.value,
                      })
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label>Key Responsibilities</label>
                  <div className={styles.textareaWrap}>
                    <textarea
                      className={styles.textarea}
                      rows={5}
                      maxLength={600}
                      value={exp.responsibilities}
                      placeholder="• Describe what you achieved in this role..."
                      onChange={(event) =>
                        updateExperience(exp.id, {
                          responsibilities: event.target.value,
                        })
                      }
                    />
                    <span className={styles.counter}>
                      {exp.responsibilities.length}/600
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button type="button" className={styles.addExp} onClick={addExperience}>
          <span aria-hidden="true">+</span> Add Another Experience
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>3. Total Experience</h3>
          <p>Help us know your overall experience.</p>
        </div>

        <div className={styles.totalRow}>
          <div className={styles.totalSelect}>
            <SelectField
              label="Total Experience"
              value={data.totalExperience}
              options={EXPERIENCE_OPTIONS}
              placeholder="Select experience"
              onChange={(value) => onChange('totalExperience', value)}
            />
          </div>
          <aside className={styles.motivate}>
            <div className={styles.motivateIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19V11M10 19V7M16 19V13M22 19H2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className={styles.motivateTitle}>Keep going!</p>
              <p>
                You&apos;re doing great. This information helps us find the best
                opportunities for you.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

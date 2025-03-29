import { EventHint } from './extensions/error-tracking/types'
import { PostHog } from './posthog-cloudflare'
import { uuidv7 } from 'posthog-core/src/vendor/uuidv7'
import { propertiesFromUnknownInput } from './extensions/error-tracking/error-conversion'
import { EventMessage } from './types'

export default class ErrorTracking {
  static async captureException(
    client: PostHog,
    error: unknown,
    hint: EventHint,
    distinctId?: string,
    additionalProperties?: Record<string | number, any>
  ): Promise<void> {
    const properties: EventMessage['properties'] = { ...additionalProperties }

    // Given stateless nature of Node SDK we capture exceptions using personless processing when no
    // user can be determined because a distinct_id is not provided e.g. exception autocapture
    if (!distinctId) {
      properties.$process_person_profile = false
    }

    const exceptionProperties = await propertiesFromUnknownInput(error, hint)

    client.capture({
      event: '$exception',
      distinctId: distinctId || uuidv7(),
      properties: {
        ...exceptionProperties,
        ...properties,
      },
    })
  }
}

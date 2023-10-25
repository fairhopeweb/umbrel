import {useLocation, useNavigate} from 'react-router-dom'

import {trpcReact} from '@/trpc/trpc'
import {sleep} from '@/utils/misc'

import {CoverMessage} from './ui/cover-message'

/** Don't show children unless logged in */
export function EnsureLoggedIn({children}: {children?: React.ReactNode}) {
	const location = useLocation()
	const navigate = useNavigate()

	const getQuery = trpcReact.debug.private.useQuery(undefined, {
		retry: false,
	})

	if (getQuery.isLoading) {
		return <CoverMessage>Checking backend for user...</CoverMessage>
	}

	if (getQuery.error) {
		if (!location.pathname.startsWith('/login')) {
			sleep(500).then(() => navigate('/login'))
			return <CoverMessage>Redirecting to login...</CoverMessage>
		}
	}

	if (getQuery?.data !== 'hi') {
		if (location.pathname.startsWith('/login')) {
			sleep(500).then(() => navigate('/'))
			return <CoverMessage>Redirecting to home...</CoverMessage>
		}
	}

	return children
}
import {useState} from 'react'
import {Link} from 'react-router-dom'

import {Loading} from '@/components/ui/loading'
import {links} from '@/constants/links'
import {buttonClass, footerLinkClass, formGroupClass, Layout} from '@/layouts/bare/shared'
import {useAuth} from '@/modules/auth/use-auth'
import {AnimatedInputError, Input, PasswordInput} from '@/shadcn-components/ui/input'
// import {LanguageDropdown} from '@/routes/settings/_components/language-dropdown'
import {trpcReact} from '@/trpc/trpc'
import {t} from '@/utils/i18n'

export default function CreateAccount() {
	const title = t('onboarding.create-account')
	const auth = useAuth()

	const [name, setName] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [localError, setLocalError] = useState('')
	const [isNavigating, setIsNavigating] = useState(false)

	const loginMut = trpcReact.user.login.useMutation({
		onSuccess: async (jwt) => {
			setIsNavigating(true)
			auth.signUpWithJwt(jwt)
		},
	})

	const registerMut = trpcReact.user.register.useMutation({
		onSuccess: async () => loginMut.mutate({password, totpToken: ''}),
	})

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Reset errors
		registerMut.reset()
		await setLocalError('')

		if (!name) {
			setLocalError(t('onboarding.create-account.failed.name-required'))
			return
		}

		if (password !== confirmPassword) {
			setLocalError(t('onboarding.create-account.failed.passwords-dont-match'))
			return
		}

		registerMut.mutate({name, password})
	}

	const remoteFormError = !registerMut.error?.data?.zodError && registerMut.error?.message
	const formError = localError || remoteFormError
	const isLoading = registerMut.isLoading || loginMut.isLoading || isNavigating

	return (
		<Layout
			title={title}
			transitionTitle={false}
			subTitle={t('onboarding.create-account.subtitle')}
			subTitleMaxWidth={630}
			footer={
				<div className='flex flex-col items-center gap-3'>
					{/* TODO: consider adding drawer on mobile */}
					{/* TODO: Uncomment and enable after fixing translations  */}
					{/* <LanguageDropdown /> */}
					<Link to={links.support} target='_blank' className={footerLinkClass}>
						{t('onboarding.contact-support')}
					</Link>
				</div>
			}
		>
			<form onSubmit={onSubmit} className='w-full'>
				<fieldset disabled={isLoading} className='flex flex-col items-center gap-5'>
					<div className={formGroupClass}>
						<Input
							placeholder={t('onboarding.create-account.name.input-placeholder')}
							autoFocus
							value={name}
							onValueChange={setName}
						/>
						<PasswordInput
							label={t('onboarding.create-account.password.input-label')}
							value={password}
							onValueChange={setPassword}
							error={registerMut.error?.data?.zodError?.fieldErrors['password']?.join('. ')}
						/>
						<PasswordInput
							label={t('onboarding.create-account.confirm-password.input-label')}
							value={confirmPassword}
							onValueChange={setConfirmPassword}
						/>
					</div>

					<div className='-my-2.5'>
						<AnimatedInputError>{formError}</AnimatedInputError>
					</div>
					<button type='submit' className={buttonClass}>
						{isLoading ? (
							<Loading>{t('onboarding.create-account.submitting')}</Loading>
						) : (
							t('onboarding.create-account.submit')
						)}
					</button>
				</fieldset>
			</form>
		</Layout>
	)
}

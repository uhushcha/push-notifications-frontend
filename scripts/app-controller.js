/* eslint-env browser */
import {PushClient} from './push-client.js';

class AppController {
	constructor() {
		this._stateChangeListener = this._stateChangeListener.bind(this);
		this._subscriptionUpdate = this._subscriptionUpdate.bind(this);

		this._pushClient = new PushClient(
			this._stateChangeListener,
			this._subscriptionUpdate
		);

		// This div contains the UI for CURL commands to trigger a push
		this._subscriptionJSONCode = getElement('.js-subscription-json');

		this._toggleSwitch = getElement('.js-enable-checkbox');
		this._toggleSwitch.addEventListener('click', () => this.togglePush());
	}

	togglePush() {
		if (this._toggleSwitch.checked) {
			this._pushClient.subscribeDevice();
		} else {
			this._pushClient.unsubscribeDevice();
		}
	}

	registerServiceWorker() {
		// Check that service workers are supported
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('./service-worker.js')
				.catch((err) => {
					console.error(err);
				});
		}
	}

	_stateChangeListener(state, data) {
		if (typeof state.interactive !== 'undefined') {
			if (state.interactive) {
				this._toggleSwitch.disabled = false;
			} else {
				this._toggleSwitch.disabled = true;
			}
		}

		if (typeof state.pushEnabled !== 'undefined') {
			if (state.pushEnabled) {
				this._toggleSwitch.checked = true;
			} else {
				this._toggleSwitch.checked = false;
			}
		}

		switch (state.id) {
		case 'UNSUPPORTED':
			console.log('Push Not Supported');
			break;
		case 'ERROR':
			console.log(state)
			console.log(data)
			console.log('Ooops a Problem Occurred');
			break;
		default:
			break;
		}
	}

	_subscriptionUpdate(subscription) {
		if (!subscription) {
			// Remove any subscription from your servers if you have
			// set it up.
			return;
		}

		this._subscriptionJSONCode.textContent =
      JSON.stringify(subscription, null, 2);

	}

}

// This is a helper method so we get an error and log in case we delete or
// rename an element we expect to be in the DOM.
function getElement(selector) {
	const e = document.querySelector(selector);
	if (!e) {
		console.error(`Failed to find element: '${selector}'`);
		throw new Error(`Failed to find element: '${selector}'`);
	}
	return e;
}

if (window) {
	window.onload = function() {
		if (!navigator.serviceWorker) {
			console.warn('Service workers are not supported in this browser.');
			return;
		}

		if (!('PushManager' in window)) {
			console.warn('Push is not supported in this browser.');
			return;
		}

		console.debug('Setting up demo.');
		const appController = new AppController();
		appController.registerServiceWorker();
	};
}

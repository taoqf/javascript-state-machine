import test from 'ava';
import StateMachine from '../dist/state-machine';

test('state machine', async (t) => {
	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	});

	t.is(fsm.state, 'green')

	await fsm.fire('warn'); t.is(fsm.state, 'yellow');
	await fsm.fire('panic'); t.is(fsm.state, 'red');
	await fsm.fire('calm'); t.is(fsm.state, 'yellow');
	await fsm.fire('clear'); t.is(fsm.state, 'green');
});

//-----------------------------------------------------------------------------

test('state machine factory', async (t) => {

	var Alarm = StateMachine.factory('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	}),
		a = Alarm(),
		b = Alarm();

	t.is(a.state, 'green')
	t.is(b.state, 'green')

	await a.fire('warn'); t.is(a.state, 'yellow'); t.is(b.state, 'green')
	await a.fire('panic'); t.is(a.state, 'red'); t.is(b.state, 'green')
	await a.fire('calm'); t.is(a.state, 'yellow'); t.is(b.state, 'green')
	await a.fire('clear'); t.is(a.state, 'green'); t.is(b.state, 'green')

	await b.fire('warn'); t.is(a.state, 'green'); t.is(b.state, 'yellow')
	await b.fire('panic'); t.is(a.state, 'green'); t.is(b.state, 'red')
	await b.fire('calm'); t.is(a.state, 'green'); t.is(b.state, 'yellow')
	await b.fire('clear'); t.is(a.state, 'green'); t.is(b.state, 'green')

});

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Register() {
	const navigate = useNavigate();
	const { login } = useApp();
	const [form, setForm] = useState({
		nombre: '',
		apellidoPaterno: '',
		apellidoMaterno: '',
		username: '',
		password: ''
	});
	const [error, setError] = useState('');

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!form.nombre || !form.apellidoPaterno || !form.apellidoMaterno || !form.username || !form.password) {
			setError('Por favor completa todos los campos');
			return;
		}
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					name: form.nombre,
					lastname_p: form.apellidoPaterno,
					lastname_m: form.apellidoMaterno,
					username: form.username,
					email: `${form.username}@example.com`, // Puedes cambiar esto si tienes un campo de email
					password: form.password,
					user_type: 1 // O el tipo que corresponda
				})
			});
			const data = await response.json();
			if (response.ok) {
				// Registro exitoso, puedes loguear al usuario o redirigir
				navigate('/login');
			} else {
				setError(data.message || 'Error al registrar usuario');
			}
		} catch (err) {
			console.error('Registration Error:', err);
			setError('Error de conexión con el servidor: ' + (err.message || err));
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
			<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
				{/* Logo/Header */}
				<div className="text-center mb-8">
					<div className="inline-block bg-green-100 rounded-full p-4 mb-4">
						<LogIn size={48} className="text-green-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Crear cuenta</h1>
					<p className="text-gray-600">Regístrate para continuar</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
						<input
							type="text"
							name="nombre"
							value={form.nombre}
							onChange={handleChange}
							placeholder="Ingresa tu nombre"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Apellido paterno</label>
						<input
							type="text"
							name="apellidoPaterno"
							value={form.apellidoPaterno}
							onChange={handleChange}
							placeholder="Ingresa tu apellido paterno"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Apellido materno</label>
						<input
							type="text"
							name="apellidoMaterno"
							value={form.apellidoMaterno}
							onChange={handleChange}
							placeholder="Ingresa tu apellido materno"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de usuario</label>
						<input
							type="text"
							name="username"
							value={form.username}
							onChange={handleChange}
							placeholder="Ingresa tu nombre de usuario"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
						<input
							type="password"
							name="password"
							value={form.password}
							onChange={handleChange}
							placeholder="Ingresa tu contraseña"
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>
					</div>
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
							{error}
						</div>
					)}
					<button
						type="submit"
						className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-2"
					>
						<LogIn size={24} />
						<span>Crear cuenta</span>
					</button>
				</form>
				<div className="mt-8 text-center">
					<span className="text-gray-600">¿Ya tienes cuenta?</span>
					<a
						href="/login"
						className="ml-2 text-blue-600 hover:text-blue-800 font-semibold underline"
					>
						Inicia sesión
					</a>
				</div>
			</div>
		</div>
	);
}

export default Register;
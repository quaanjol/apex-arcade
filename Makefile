deploy-tmp:
	# this is to deploy all metadata in package-tmp.xml file to target org
	sf project deploy start --manifest manifest/package-tmp.xml -o sf.apex.arcade@gmail.com

retrieve-tmp:
	# this is to retrieve all metadata in package-tmp.xml file from target org
	sf project retrieve start --manifest manifest/package-tmp.xml -o sf.apex.arcade@gmail.com
